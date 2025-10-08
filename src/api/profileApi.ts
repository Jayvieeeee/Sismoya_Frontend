import axiosInstance from "@/utils/axios"

export async function getProfile() {
  try {
    const token = localStorage.getItem("token")
    console.log("Token:", token); // Check if token exists
    if (!token) throw new Error("No token found")

    const res = await axiosInstance.get("/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    console.log("Profile response:", res); // Check full response
    return res.data.user
  } catch (error: any) {
    console.error("Profile fetch error details:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    })
    throw error
  }
}

export async function updateProfile(profileData: any) {
  try {
    const token = localStorage.getItem("token")
    if (!token) throw new Error("No token found")

    // ✅ use the same names as in formData
    const formattedData = {
      first_name: profileData.first_name,
      last_name: profileData.last_name,
      email: profileData.email,
      contact_no: profileData.contact_no,
    }

    console.log("Sending data:", formattedData)

    const res = await axiosInstance.put("/profile", formattedData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
    })

    return res.data
  } catch (error: any) {
    console.error("Update failed:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    })
    throw error
  }
}