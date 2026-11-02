import axiosInstance from "@/utils/axios";

export async function loginUser(identifier: string, password: string) {
  try {
    const res = await axiosInstance.post("/login", { identifier, password });

    if (!res.data.error) {
      if (
        typeof res.data.token !== "string" ||
        typeof res.data.user !== "object" ||
        res.data.user === null
      ) {
        throw new Error("Login response is missing user or token data");
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
    }

    return res.data;  
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Login failed");
  }
}
