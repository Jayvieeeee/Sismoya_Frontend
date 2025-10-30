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

  if (Array.isArray(res.data)) return res.data
  if (Array.isArray(res.data.addresses)) return res.data.addresses
  if (Array.isArray(res.data.data)) return res.data.data

  return []
}

// Add new address
export async function addAddress(data: AddressPayload) {
  const res = await axiosInstance.post("/addresses", data, {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  })
  return res.data
}

// Update existing address
export async function updateAddress(id: number, data: AddressPayload) {
  const res = await axiosInstance.put(`/addresses/${id}`, data, {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  })
  return res.data
}

// Delete address
export async function deleteAddress(id: number) {
  
  const res = await axiosInstance.delete(`/addresses/${id}`, {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  })
  
  return res.data
}