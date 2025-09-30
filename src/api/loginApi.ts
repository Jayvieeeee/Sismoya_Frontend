import axiosInstance from "@/utils/axios"

export async function loginUser(identifier: string, password: string) {
  try {
    const res = await axiosInstance.post("/login", { identifier, password })

    if (!res.data.error) {
      // Save token
      localStorage.setItem("token", res.data.token)

      // (Optional) also save user for quick access
      localStorage.setItem("user", JSON.stringify(res.data.user))
    }

    return res.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Login failed")
  }
}
