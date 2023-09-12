# frozen_string_literal: true

module Pawoo::AccountExtension
  extend ActiveSupport::Concern

  included do
    has_many :oauth_authentications, through: :user

    # Check for invalid characters
    validates :display_name, pawoo_crashed_unicode: true
    validates :note, pawoo_crashed_unicode: true
  end

  def bootstrap_timeline?
    local? && (Setting.bootstrap_timeline_accounts || '').split(',').map { |str| str.strip.gsub(/\A@/, '') }.include?(username)
  end
end