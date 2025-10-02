import axiosInstance from "../utils/axios"

export async function getContainers() {
  try {
    const res = await axiosInstance.get("/gallons")
    console.log("API Response:", res.data)
    return res.data.map((c: any) => {
      // Use the image_url directly to build the correct path
      let imageUrl = c.image_url
      
      // Construct the URL to match your API route
      // This creates a path like: '/images/slim.png'
      if (imageUrl) {
        // Ensure it starts with a slash for your route
        imageUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`
        // The frontend will now request from: https://sismoya.com/api/images/slim.png
        // which matches your protected route
      }
      
      return {
        id: Number(c.gallon_id),
        type: c.name,
        liters: c.size, // Display as is, no conversion or removal
        price: Number(c.price),
        qty: 1,
        image_url: imageUrl, // This will be the path for your '/images/{filename}' route
      }
    })
  } catch (error) {
    console.error("Failed to fetch containers:", error)
    return []
  }
}