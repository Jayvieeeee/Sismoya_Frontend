import axiosInstance from "../utils/axios";

export interface CartItem {
  cart_item_id?: number;
  gallon_id: number;
  id?: number;
  type?: string;
  liters?: number;
  price?: number;
  quantity: number;
  qty?: number;
  total_price?: number;
  image_url?: string;
  selected?: boolean;
}

// Get user cart from backend - GET /cartItems
export async function getUserCart(): Promise<CartItem[]> {
  try {
    const response = await axiosInstance.get(`/cartItems`);
    return response.data.cart_items || [];
  } catch (error: any) {
    console.error("Get cart error:", error.response?.data || error.message);
    throw error;
  }
}

// Add item to cart in backend - POST /cartItems
export async function addToCartBackend(gallonId: number, quantity: number = 1) {
  try {
    const response = await axiosInstance.post("/cartItems", {
      gallonId,
      quantity
    });
    return response.data;
  } catch (error: any) {
    console.error("Add to cart error:", error.response?.data || error.message);
    throw error;
  }
}

// Remove items from cart - DELETE /cartItems
export async function removeFromCartBackend(cartItemIds: number[]) {
  try {
    const response = await axiosInstance.delete("/cartItems", {
      data: {
        cartItemIds
      }
    });
    return response.data;
  } catch (error: any) {
    console.error("Remove from cart error:", error.response?.data || error.message);
    throw error;
  }
}