# frozen_string_literal: true

module Pawoo::Auth::RegistrationsControllerConcern
  extend ActiveSupport::Concern

  def create
    if verify_recaptcha
      super
    else
      build_resource(sign_up_params)
      resource.validate # Look for any other validation errors besides Recaptcha
      set_minimum_password_length
      render :new
    end
  end

  def update
    if current_user.initial_password_usage
      pawoo_send_reset_password_instructions
    else
      super
    end
  end

  private

  def pawoo_send_reset_password_instructions
    resource = resource_class.send_reset_password_instructions(email: current_user.email)

    if successfully_sent?(resource)
      redirect_to edit_user_registration_path
    else
      render :edit, status: 422
    end
  end
end