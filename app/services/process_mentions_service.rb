# frozen_string_literal: true

class ProcessMentionsService < BaseService
  include Payloadable

  # Scan status for mentions and fetch remote mentioned users, create
  # local mention pointers, send Salmon notifications to mentioned
  # remote users
  # @param [Status] status
  def call(status)
    @status = status

    return unless @status.local?

    @previous_mentions = @status.active_mentions.includes(:account).to_a
    @current_mentions  = []

    Status.transaction do
      scan_text!
      assign_mentions!
    end
  end

  private

  def scan_text!
    enabled_time_limit = Pawoo::TimeLimit.enabled?(@status)
    @status.text = @status.text.gsub(Account::MENTION_RE) do |match|
      username, domain = Regexp.last_match(1).split('@')

      domain = begin
        if TagManager.instance.local_domain?(domain)
          nil
        else
          TagManager.instance.normalize_domain(domain)
        end
      end

      mentioned_account = Account.find_remote(username, domain)

      # Unapproved and unconfirmed accounts should not be mentionable
      next match if mentioned_account&.local? && !(mentioned_account.user_confirmed? && mentioned_account.user_approved?)

      # If status enables time limit and mentions an activity pub user, ignore it
      next match if !mentioned_account.local? && mentioned_account.activitypub? && enabled_time_limit

      # If the account cannot be found or isn't the right protocol,
      # first try to resolve it
      if mention_undeliverable?(mentioned_account)
        begin
          mentioned_account = ResolveAccountService.new.call(Regexp.last_match(1))
        rescue Webfinger::Error, HTTP::Error, OpenSSL::SSL::SSLError, Mastodon::UnexpectedResponseError
          mentioned_account = nil
        end
      end

      # If after resolving it still isn't found or isn't the right
      # protocol, then give up
      next match if mention_undeliverable?(mentioned_account) || mentioned_account&.suspended?

      mention   = @previous_mentions.find { |x| x.account_id == mentioned_account.id }
      mention ||= mentioned_account.mentions.new(status: @status)

      @current_mentions << mention

      "@#{mentioned_account.acct}"
    end

    @status.save!
  end

  def assign_mentions!
    # Make sure we never mention blocked accounts
    unless @current_mentions.empty?
      mentioned_domains = @current_mentions.map { |m| m.account.domain }.compact.uniq
      blocked_domains   = Set.new(mentioned_domains.empty? ? [] : AccountDomainBlock.where(account_id: @status.account_id, domain: mentioned_domains))
      mentioned_account_ids = @current_mentions.map(&:account_id)
      blocked_account_ids = Set.new(@status.account.block_relationships.where(target_account_id: mentioned_account_ids).pluck(:target_account_id))

      @current_mentions.select! { |mention| !(blocked_account_ids.include?(mention.account_id) || blocked_domains.include?(mention.account.domain)) }
    end

    @current_mentions.each do |mention|
      mention.save if mention.new_record?
    end

    # If previous mentions are no longer contained in the text, convert them
    # to silent mentions, since withdrawing access from someone who already
    # received a notification might be more confusing
    removed_mentions = @previous_mentions - @current_mentions

    Mention.where(id: removed_mentions.map(&:id)).update_all(silent: true) unless removed_mentions.empty?
  end

  def mention_undeliverable?(mentioned_account)
    mentioned_account.nil? || (!mentioned_account.local? && !mentioned_account.activitypub?)
  end
end
