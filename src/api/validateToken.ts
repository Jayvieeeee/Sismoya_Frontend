// src/api/validateToken.ts
import axiosInstance from "@/utils/axios";

export async function validateToken() {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const res = await axiosInstance.get("/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });

    return !!res.data.user; // ✅ returns true if user is fetched
  } catch (err) {
    return false;
  }
}
