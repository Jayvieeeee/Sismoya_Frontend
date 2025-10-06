import axiosInstance from "../utils/axios";
import { getProfileSafe } from "@/utils/auth";

export interface CartItem {
  cart_item_id: number;
  gallon_id: number;
  name: string;        
  size: string;        
  price: number;
  quantity: number;
  total_price: number;
  image_url: string;
  selected?: boolean;
}

// ----------------------------
// 🔧 Helper: normalize backend items
// ----------------------------
function normalizeCartItems(items: any[]): CartItem[] {
  return items.map((item: any) => ({
    ...item,
    price: Number(item.price) || 0,
    total_price: Number(item.total_price) || 0,
  }));
}

// ----------------------------
// 🛒 GET /cartItems
// ----------------------------
export async function getUserCart(): Promise<CartItem[]> {
  try {
    const user = await getProfileSafe();
    if (!user?.user_id) return [];

    const response = await axiosInstance.get("/cartItems", {
      params: { user_id: user.user_id },
    });

    if (response.data?.success && Array.isArray(response.data.cart_items)) {
      return normalizeCartItems(response.data.cart_items);
    }

    return [];
  } catch {
    return [];
  }
}

// ----------------------------
// 🛒 POST /cartItems (add or update) - FIXED
// ----------------------------
export async function addToCartBackend(gallon_id: number, quantity: number = 1): Promise<CartItem[]> {
  try {
    const user = await getProfileSafe();
    if (!user?.user_id) throw new Error("No user ID available");

    const response = await axiosInstance.post("/cartItems", {
      user_id: user.user_id,
      gallon_id, // ✅ FIXED: Changed from gallonId to gallon_id
      quantity,
    });

    return normalizeCartItems(response.data?.cart_items || []);
  } catch (error: any) {
    throw error;
  }
}

// ----------------------------
// 🛒 DELETE /cartItems
// ----------------------------
export async function removeFromCartBackend(cartItemIds: number[]): Promise<CartItem[]> {
  try {
    const user = await getProfileSafe();
    if (!user?.user_id) throw new Error("No user ID available");

    const response = await axiosInstance.delete("/cartItems", {
      data: { user_id: user.user_id, cart_item_ids: cartItemIds },
    });

    return normalizeCartItems(response.data?.cart_items || []);
  } catch (error: any) {
    throw error;
  }
}

// ----------------------------
// 🛒 PUT /cartItems/decrease
// ----------------------------
export async function decreaseQuantityBackend(cartItemId: number): Promise<CartItem[]> {
  try {
    const user = await getProfileSafe();
    if (!user?.user_id) throw new Error("No user ID available");

    const response = await axiosInstance.put("/cartItems/decrease", {
      user_id: user.user_id,
      cart_item_id: cartItemId,
    });

    return normalizeCartItems(response.data?.cart_items || []);
  } catch (error: any) {
    throw error;
  }
}

// ----------------------------
// 🛒 PUT /cartItems/increase
// ----------------------------
export async function increaseQuantityBackend(cartItemId: number): Promise<CartItem[]> {
  try {
    const user = await getProfileSafe();
    if (!user?.user_id) throw new Error("No user ID available");

    const response = await axiosInstance.put("/cartItems/increase", {
      user_id: user.user_id,
      cart_item_id: cartItemId,
    });

    return normalizeCartItems(response.data?.cart_items || []);
  } catch (error: any) {
    throw error;
  }
}

// ----------------------------
// 🛒 Smart Update
// ----------------------------
export async function updateCartItemBackend(cartItemId: number, newQuantity: number): Promise<CartItem[]> {
  try {
    if (newQuantity === 0) {
      return await removeFromCartBackend([cartItemId]);
    }

    const currentCart = await getUserCart();
    const currentItem = currentCart.find((item) => item.cart_item_id === cartItemId);

    if (!currentItem) throw new Error("Cart item not found");

    if (newQuantity > currentItem.quantity) {
      return await increaseQuantityBackend(cartItemId);
    } else if (newQuantity < currentItem.quantity) {
      return await decreaseQuantityBackend(cartItemId);
    }

    return currentCart;
  } catch (error: any) {
    throw error;
  }
}

// ----------------------------
// 🛒 Bulk Clear
// ----------------------------
export async function clearSelectedItemsBackend(cartItemIds: number[]): Promise<CartItem[]> {
  return await removeFromCartBackend(cartItemIds);
}