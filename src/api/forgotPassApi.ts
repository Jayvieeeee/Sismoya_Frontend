// src/api/forgotPassApi.ts
import axiosInstance from "../utils/axios";

// STEP 1: request password reset link / code
export async function requestPasswordReset(email: string) {
  try {
    const response = await axiosInstance.post("/forgot-password", { email });
    return response.data;
  } catch (error: any) {
    console.error("Forgot password error:", error.response?.data || error.message);
    throw error;
  }
}

// STEP 2: verify the reset code sent by email
export async function verifyResetCode(email: string, code: string) {
  try {
    const response = await axiosInstance.post("/verify-reset-code", { email, code });
    return response.data;
  } catch (error: any) {
    console.error("Verify reset code error:", error.response?.data || error.message);
    throw error;
  }
}

// STEP 3: reset the password after verification
export async function resetPassword(email: string, newPassword: string, code: string) {
  try {
    const response = await axiosInstance.post("/reset-password", {
      email,
      password: newPassword,
      code,
    });
    return response.data;
  } catch (error: any) {
    console.error("Reset password error:", error.response?.data || error.message);
    throw error;
  }
}

// STEP 4: resend the verification code
export async function resendResetCode(email: string) {
  try {
    const response = await axiosInstance.post("/resend-reset-code", { email });
    return response.data;
  } catch (error: any) {
    console.error("Resend reset code error:", error.response?.data || error.message);
    throw error;
  }
}