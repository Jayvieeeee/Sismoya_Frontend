import axiosInstance from "../utils/axios";

// Change password after verifying reset code
export async function changePassword(email: string, password: string, confirm_password: string, code: string) {
  try {
    const response = await axiosInstance.post("/reset-password", {
      email,
      password,
      confirm_password, // send both fields
      code,
    });
    return response.data;
  } catch (error: any) {
    console.error("Change password error:", error.response?.data || error.message);
    throw error;
  }
}
