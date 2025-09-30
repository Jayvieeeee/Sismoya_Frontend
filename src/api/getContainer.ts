import axiosInstance from "../utils/axios"

export async function getContainers() {
  try {
    const res = await axiosInstance.get("/gallons")

    return res.data.map((c: any) => ({
      id: Number(c.gallon_id),   
      type: c.name,
      liters: Number(c.size),    
      price: Number(c.price),
      qty: 1,
      image_url: `http://192.168.1.20/sismoya/${c.image_url.replace("imgaes", "images")}`,
    }))
  } catch (error) {
    console.error("Failed to fetch containers:", error)
    return []
  }
}
