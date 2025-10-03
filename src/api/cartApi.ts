import axiosInstance from "../utils/axios";
import { getProfileSafe } from "@/utils/auth";

export interface CartItem {
  cart_item_id: number;
  gallon_id: number;
  name: string;        // Backend returns 'name'
  size: string;        // Backend returns 'size' 
  price: number;
  quantity: number;
  total_price: number;
  image_url: string;
  selected?: boolean;
}

// Get user cart from backend - GET /cartItems
export async function getUserCart(): Promise<CartItem[]> {
  try {
    const user = await getProfileSafe();
    if (!user?.user_id) {
      console.log('❌ No user ID available for getting cart');
      return [];
    }

    console.log('🛒 Fetching cart for user:', user.user_id);
    
    const response = await axiosInstance.get(`/cartItems`, {
      params: { userId: user.user_id }
    });
    
    console.log('📦 Raw cart response:', response.data);
    
    // Handle the backend response format properly
    let cartItems: CartItem[] = [];
    
    if (response.data && response.data.success) {
      // Backend returns {success: true, cart_items: []}
      if (Array.isArray(response.data.cart_items)) {
        cartItems = response.data.cart_items.map((item: any) => ({
          ...item,
          // Ensure price is a number
          price: Number(item.price) || 0,
          total_price: Number(item.total_price) || 0
        }));
      }
    } else if (Array.isArray(response.data)) {
      // Direct array response (fallback)
      cartItems = response.data.map((item: any) => ({
        ...item,
        price: Number(item.price) || 0,
        total_price: Number(item.total_price) || 0
      }));
    }
    
    console.log(`✅ Got ${cartItems.length} cart items`);
    console.log('🔍 First item structure:', cartItems[0]);
    return cartItems;
  } catch (error: any) {
    console.error("❌ Get cart error:", error.response?.data || error.message);
    return [];
  }
}

// Add item to cart in backend - POST /cartItems
export async function addToCartBackend(gallonId: number, quantity: number = 1): Promise<CartItem[]> {
  try {
    const user = await getProfileSafe();
    if (!user?.user_id) {
      throw new Error('No user ID available');
    }

    console.log('🛒 Adding to cart:', { userId: user.user_id, gallonId, quantity });

    const response = await axiosInstance.post("/cartItems", {
      userId: user.user_id,
      gallonId,
      quantity
    });
    
    console.log('📦 Add to cart response:', response.data);
    
    // Handle backend response format
    let cartItems: CartItem[] = [];
    
    if (response.data && response.data.success && Array.isArray(response.data.cart_items)) {
      cartItems = response.data.cart_items.map((item: any) => ({
        ...item,
        price: Number(item.price) || 0,
        total_price: Number(item.total_price) || 0
      }));
    } else {
      // If we can't parse the updated cart, fetch it fresh
      console.warn('⚠️ Could not parse updated cart from response, fetching fresh...');
      cartItems = await getUserCart();
    }
    
    return cartItems;
  } catch (error: any) {
    console.error("❌ Add to cart error:", error.response?.data || error.message);
    throw error;
  }
}

// Remove items from cart - DELETE /cartItems
export async function removeFromCartBackend(cartItemIds: number[]): Promise<boolean> {
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
    
    // Backend returns {success: boolean}
    return response.data?.success === true;
  } catch (error: any) {
    console.error("❌ Remove from cart error:", error.response?.data || error.message);
    throw error;
  }
}

// Update cart item quantity
export async function updateCartItemBackend(cartItemId: number, quantity: number): Promise<CartItem[]> {
  try {
    if (quantity === 0) {
      // If quantity is 0, remove the item
      await removeFromCartBackend([cartItemId]);
      return await getUserCart();
    }

    const user = await getProfileSafe();
    if (!user?.user_id) {
      throw new Error('No user ID available');
    }

    // Since backend doesn't have update, we'll use the add endpoint which handles updates
    // First get current cart to find the gallon_id
    const currentCart = await getUserCart();
    const itemToUpdate = currentCart.find(item => item.cart_item_id === cartItemId);
    
    if (!itemToUpdate) {
      throw new Error('Cart item not found');
    }

    // Use addToCart which handles both insert and update
    return await addToCartBackend(itemToUpdate.gallon_id, quantity);
  } catch (error: any) {
    console.error("❌ Update cart item error:", error.response?.data || error.message);
    throw error;
  }
}

// Clear selected items
export async function clearSelectedItemsBackend(cartItemIds: number[]): Promise<boolean> {
  return await removeFromCartBackend(cartItemIds);
}