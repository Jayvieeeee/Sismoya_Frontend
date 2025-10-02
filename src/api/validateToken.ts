// src/api/validateToken.ts
import axiosInstance from "@/utils/axios";

export async function validateToken() {
  const token = localStorage.getItem("token");

  if (!token) return false;

  try {
    const res = await axiosInstance.get("/validate-token", {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data.valid; // backend should return { valid: true }
  } catch (err) {
    return false;
  }
}
