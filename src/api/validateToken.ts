import axiosInstance from "@/utils/axios";

export async function validateToken(): Promise<boolean> {
  const token = localStorage.getItem("token");
  if (!token) {
    console.log('🔐 No token found');
    return false;
  }

  try {
    const res = await axiosInstance.get("/profile");
    return !!res.data.user;
  } catch (err: any) {
    console.log('🔐 Token validation error:', err.response?.status, err.response?.data?.message);
    
    // Only return false for actual authentication errors (401 Unauthorized)
    if (err.response?.status === 401) {
      console.log('🔒 Authentication failed - token is invalid');
      return false;
    }
    
    // For all other errors (network issues, server errors, cart API issues, etc.)
    // Assume the token might still be valid and return true
    console.log('🔧 Non-auth error during token validation, proceeding with token');
    console.log('   Error details:', err.message);
    return true;
  }
}