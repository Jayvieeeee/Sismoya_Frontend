import axiosInstance from "@/utils/axios"
import router from "@/router"


export async function getProfile() {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No token found')
    }
    
    const res = await axiosInstance.get("/profile") 
    return res.data.user
  } catch (error: any) {
    console.error('Profile fetch error:', error.response?.status, error.response?.data)
    throw error
  }
}

export async function logout() {
  try {
    const res = await axiosInstance.post("/logout")
    if (res.data && !res.data.error) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      return { success: true, message: "Logged out successfully!" }
    }
    return { success: false, message: res.data.message || "Logout failed" }
  } catch (err: any) {
    console.error("Logout error:", err)
    // Even if logout API fails, clear local storage
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    return { success: false, message: "Something went wrong" }
  }
}

export async function validateToken(): Promise<boolean> {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      return false
    }
    
    await getProfile()
    return true
  } catch (error: any) {
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      
      router.push('/login')
      return false
    } else {
      return true
    }
  }
}

export async function getProfileSafe() {
  try {
    return await getProfile()
  } catch (error) {
    console.log('Safe profile get failed, returning null')
    return null
  }
}

export const handleLogout = async (message = 'Your session has expired. Please log in again.') => {
  const Swal = await import('sweetalert2');
  
  await Swal.default.fire({
    icon: 'warning',
    title: 'Session Expired',
    text: message,
    confirmButtonText: 'Login Again',
    confirmButtonColor: '#d33',
    showCancelButton: true,
    cancelButtonText: 'Stay',
    timer: 10000,
    timerProgressBar: true
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = '/login';
    }
  });
};