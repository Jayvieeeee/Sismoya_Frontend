import axiosInstance from "@/utils/axios"

export interface AddressPayload {
  label: string
  address: string
  isDefault?: boolean
}


export async function getAddresses() {
  const res = await axiosInstance.get("/addresses", {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  })

  console.log("📦 getAddresses raw response:", res.data)

  if (Array.isArray(res.data)) return res.data
  if (Array.isArray(res.data.addresses)) return res.data.addresses
  if (Array.isArray(res.data.data)) return res.data.data

  return []
}


