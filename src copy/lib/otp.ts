import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface OTPVerificationResponse {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * Send OTP to email for account verification
 */
export async function sendOTPForVerification(email: string): Promise<OTPVerificationResponse> {
  try {
    // Supabase will automatically send OTP when using signUp with email confirmation
    const { data, error } = await supabase.auth.signUp({
      email,
      password: Math.random().toString(36).slice(-15), // Temporary password
      options: {
        emailRedirectTo: `${window.location.origin}/verify-email`,
      },
    });

    if (error) throw error;

    return {
      success: true,
      message: "OTP sent to your email",
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Failed to send OTP",
      error: error.message,
    };
  }
}

/**
 * Send OTP to email for password reset
 */
export async function sendOTPForPasswordReset(email: string): Promise<OTPVerificationResponse> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;

    return {
      success: true,
      message: "Password reset code sent to your email",
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Failed to send reset code",
      error: error.message,
    };
  }
}

/**
 * Verify OTP token
 */
export async function verifyOTPToken(
  email: string,
  token: string,
  type: "recovery" | "email_change" | "signup" = "signup"
): Promise<OTPVerificationResponse> {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type,
    });

    if (error) throw error;

    return {
      success: true,
      message: "Email verified successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Invalid or expired OTP",
      error: error.message,
    };
  }
}

/**
 * Generate and send OTP for phone verification
 */
export async function sendOTPToPhone(phone: string): Promise<OTPVerificationResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) throw error;

    return {
      success: true,
      message: "OTP sent to your phone",
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Failed to send OTP to phone",
      error: error.message,
    };
  }
}

/**
 * Verify phone OTP
 */
export async function verifyPhoneOTP(phone: string, token: string): Promise<OTPVerificationResponse> {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: "sms",
    });

    if (error) throw error;

    return {
      success: true,
      message: "Phone verified successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Invalid or expired OTP",
      error: error.message,
    };
  }
}

/**
 * Resend OTP
 */
export async function resendOTP(email: string, type: "signup" | "email_change" = "signup"): Promise<OTPVerificationResponse> {
  try {
    const { error } = await supabase.auth.resend({
      type,
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/verify-email`,
      },
    });

    if (error) throw error;

    return {
      success: true,
      message: "OTP resent to your email",
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Failed to resend OTP",
      error: error.message,
    };
  }
}
