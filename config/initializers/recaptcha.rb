# frozen_string_literal: true

Recaptcha.configure do |config|
  if Rails.env.production?
    config.site_key = ENV['RECAPTCHA_SITE_KEY']
    config.secret_key = ENV['RECAPTCHA_SECRET_KEY']
  else
    # test keys
    # https://developers.google.com/recaptcha/docs/faq#id-like-to-run-automated-tests-with-recaptcha.-what-should-i-do
    config.site_key = '6Ldf3ycoAAAAAJ9I7uJphNXqQXF1M7NPRLIpwuwb'
    config.secret_key = '6Ldf3ycoAAAAAGYtkln8CJKmgoF83UmxGyVzYnF9'
  end
end

