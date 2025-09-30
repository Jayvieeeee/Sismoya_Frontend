import axiosInstance from "../utils/axios";

export async function verifyResetCode(email: string, code: string) {
  try {
    const response = await axiosInstance.post("/verify-reset-code", {
      email,
      code,
    });
    return response.data;
  } catch (error: any) {
    console.error("Verify reset code error:", error.response?.data || error.message);
    throw error;
  }
}
