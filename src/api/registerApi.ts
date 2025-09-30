import axiosInstance from "../utils/axios";

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  contact_no: string;
  username: string;
  password: string;
}

export async function registerUser(payload: RegisterPayload) {
  try {
    const response = await axiosInstance.post("/register", payload);
    return response.data;
  } catch (error: any) {
    console.error("Register error:", error.response?.data || error.message);
    throw error;
  }
}
