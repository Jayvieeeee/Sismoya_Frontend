import axiosInstance from "../utils/axios"

export async function getContainers() {
  try {
    const res = await axiosInstance.get("/gallons")

    return res.data.map((c: any) => {
      let imageUrl = ""

      if (c.image_url) {
        // Use relative path - the browser will handle the full URL
        imageUrl = c.image_url.startsWith("/") 
          ? c.image_url 
          : `/${c.image_url}`
      }

      return {
        id: Number(c.gallon_id),
        type: c.name,
        liters: c.size,
        price: Number(c.price),
        qty: 1,
        image_url: imageUrl,
      }
    })
  } catch (error) {
    console.error("Failed to fetch containers:", error)
    return []
  }
}
