import axiosInstance from "@/utils/axios";

export async function loginUser(identifier: string, password: string) {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  try {
    const res = await axiosInstance.post("/login", { identifier, password });

    if (res.data.error) {
      throw new Error(res.data.message || "Login failed");
    }

    if (
      typeof res.data.token !== "string" ||
      !res.data.user ||
      typeof res.data.user.role !== "string"
    ) {
      throw new Error("Login response is missing required session data");
    }

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));

    return res.data;
  } catch (error: any) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    throw new Error(error.response?.data?.message || error.message || "Login failed");
  }
}
