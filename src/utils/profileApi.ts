import axiosInstance from "@/utils/axios"

export async function changePassword(oldPassword: string, newPassword: string, confirmPassword: string) {
  const res = await axiosInstance.put(
    "/change-password",
    {
      old_password: oldPassword,
      new_password: newPassword,
      confirm_password: confirmPassword,
    },
    {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    }
  )
  return res.data
}
