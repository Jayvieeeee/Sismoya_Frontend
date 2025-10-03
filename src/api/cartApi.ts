import axiosInstance from "../utils/axios";
import { getProfileSafe } from "@/utils/auth";

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
    const user = await getProfileSafe();
    if (!user?.user_id) {
      throw new Error('No user ID available');
    }

    const response = await axiosInstance.get(`/cartItems`, {
      params: { userId: user.user_id }
    });
    
    if (response.data.error) {
      throw new Error(response.data.message || 'Failed to get cart items');
    }
    
    return response.data.cart_items || [];
  } catch (error: any) {
    console.error("Get cart error:", error.response?.data || error.message);
    throw error;
  }
}

// Add item to cart in backend - POST /cartItems
export async function addToCartBackend(gallonId: number, quantity: number = 1) {
  try {
    const user = await getProfileSafe();
    if (!user?.user_id) {
      throw new Error('No user ID available');
    }

    const response = await axiosInstance.post("/cartItems", {
      userId: user.user_id,
      gallonId,
      quantity
    });
    
    if (response.data.error) {
      throw new Error(response.data.message || 'Failed to add item to cart');
    }
    
    return response.data;
  } catch (error: any) {
    console.error("Add to cart error:", error.response?.data || error.message);
    throw error;
  }
}

// Remove items from cart - DELETE /cartItems
export async function removeFromCartBackend(cartItemIds: number[]) {
  try {
    const user = await getProfileSafe();
    if (!user?.user_id) {
      throw new Error('No user ID available');
    }

    const response = await axiosInstance.delete("/cartItems", {
      data: {
        userId: user.user_id,
        cartItemIds
      }
    });
    
    if (response.data.error) {
      throw new Error(response.data.message || 'Failed to remove items from cart');
    }
    
    return response.data;
  } catch (error: any) {
    console.error("Remove from cart error:", error.response?.data || error.message);
    throw error;
  }
}

// Update item quantity in backend - PUT /cartItems
export async function updateCartItemBackend(cartItemId: number, quantity: number) {
  try {
    const user = await getProfileSafe();
    if (!user?.user_id) {
      throw new Error('No user ID available');
    }

    const response = await axiosInstance.put("/cartItems", {
      userId: user.user_id,
      cartItemId,
      quantity
    });
    
    if (response.data.error) {
      throw new Error(response.data.message || 'Failed to update cart item');
    }
    
    return response.data;
  } catch (error: any) {
    console.error("Update cart item error:", error.response?.data || error.message);
    throw error;
  }
}

// Clear selected items from cart
export async function clearSelectedItemsBackend(cartItemIds: number[]) {
  try {
    const user = await getProfileSafe();
    if (!user?.user_id) {
      throw new Error('No user ID available');
    }

    const response = await axiosInstance.post("/cartItems/clear-selected", {
      userId: user.user_id,
      cartItemIds
    });
    
    if (response.data.error) {
      throw new Error(response.data.message || 'Failed to clear selected items');
    }
    
    return response.data;
  } catch (error: any) {
    console.error("Clear selected items error:", error.response?.data || error.message);
    throw error;
  }
}

// Temporary debug function in cartApi.ts
export async function debugCartAPI() {
  try {
    const user = await getProfileSafe();
    console.log('🔍 Debug User:', user);
    console.log('🔍 User ID:', user?.user_id);
    
    if (!user?.user_id) {
      console.log('❌ No user ID available');
      return;
    }

    console.log('🔍 Testing GET /cartItems with userId:', user.user_id);
    
    const response = await axiosInstance.get(`/cartItems`, {
      params: { userId: user.user_id }
    });
    
    console.log('✅ GET /cartItems success:', response.data);
    return response.data;
    
  } catch (error: any) {
    console.error('❌ GET /cartItems failed:', error.response?.data || error.message);
    console.error('❌ Error details:', error);
    throw error;
  }
}

// Call this in your browser console to test
// debugCartAPI()