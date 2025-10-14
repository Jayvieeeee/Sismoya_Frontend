import axiosInstance from "@/utils/axios";

// Get profile
export async function getProfile() {
  const res = await axiosInstance.get("/profile", {
    headers: { Authorization: "Bearer " + localStorage.getItem("token") }
  });
  return res.data.user;
}

// Update profile
export async function updateProfile(profileData: {
  first_name?: string;
  last_name?: string;
  email?: string;
  contact_no?: string;
}) {
  const res = await axiosInstance.put("/update-profile", profileData, {
    headers: { Authorization: "Bearer " + localStorage.getItem("token") }
  });
  return res.data;
}

// Change password
export async function changePassword(
  oldPassword: string,
  newPassword: string,
  confirmPassword: string
) {
  const res = await axiosInstance.put(
    "/change-password",
    { old_password: oldPassword, new_password: newPassword, confirm_password: confirmPassword },
    { headers: { Authorization: "Bearer " + localStorage.getItem("token") } }
  );
  return res.data;
}
