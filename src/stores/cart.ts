import { defineStore } from 'pinia';
import type { CartItem } from '@/api/cartApi';
import { getUserCart, addToCartBackend, removeFromCartBackend, updateCartItemBackend } from '@/api/cartApi';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[],
    loading: false,
    error: null as string | null,
  }),

  getters: {
    totalItems: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: (state) => state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    isEmpty: (state) => state.items.length === 0,
    
    // Get items with frontend-compatible field names
    itemsForDisplay: (state) => {
      return state.items.map(item => ({
        ...item,
        // Map backend fields to frontend expected fields
        type: item.name,        // Map 'name' to 'type'
        liters: parseFloat(item.size) || 0, // Map 'size' to 'liters' and convert to number
        qty: item.quantity,     // Add 'qty' alias for compatibility
        selected: item.selected || false
      }));
    }
  },

  actions: {
    async loadFromBackend() {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('🔄 Loading cart from backend...');
        const backendItems = await getUserCart();
        console.log('📦 Backend items received:', backendItems);
        
        // Ensure backendItems is always treated as an array
        const safeItems = Array.isArray(backendItems) ? backendItems : [];
        
        this.items = safeItems.map(item => ({
          ...item,
          // Ensure all required fields are present with correct types
          cart_item_id: item.cart_item_id || 0,
          gallon_id: item.gallon_id || 0,
          quantity: item.quantity || 0,
          price: Number(item.price) || 0, // Ensure price is a number
          total_price: Number(item.total_price) || (Number(item.price) || 0) * (item.quantity || 0)
        }));
        
        console.log(`✅ Loaded ${this.items.length} items into cart`);
      } catch (error: any) {
        console.error('❌ Failed to load cart from backend:', error);
        this.error = error.message;
        this.items = []; // Reset to empty array on error
      } finally {
        this.loading = false;
      }
    },

    async addToCart(gallonId: number, quantity: number = 1) {
      this.loading = true;
      this.error = null;
      
      try {
        console.log(`🛒 Adding item ${gallonId} with quantity ${quantity}`);
        const updatedCart = await addToCartBackend(gallonId, quantity);
        
        // Ensure we have an array
        const safeItems = Array.isArray(updatedCart) ? updatedCart : [];
        this.items = safeItems.map(item => ({
          ...item,
          price: Number(item.price) || 0,
          total_price: Number(item.total_price) || 0
        }));
        
        console.log(`✅ Cart updated with ${safeItems.length} items`);
      } catch (error: any) {
        console.error('❌ Failed to add to cart:', error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    async removeFromCart(cartItemIds: number[]) {
      this.loading = true;
      try {
        await removeFromCartBackend(cartItemIds);
        // Reload the cart to get updated state
        await this.loadFromBackend();
      } catch (error: any) {
        console.error('❌ Failed to remove from cart:', error);
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateQuantity(cartItemId: number, quantity: number) {
      this.loading = true;
      try {
        const updatedCart = await updateCartItemBackend(cartItemId, quantity);
        this.items = Array.isArray(updatedCart) ? updatedCart.map(item => ({
          ...item,
          price: Number(item.price) || 0,
          total_price: Number(item.total_price) || 0
        })) : [];
      } catch (error: any) {
        console.error('❌ Failed to update quantity:', error);
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    toggleSelect(cartItemId: number) {
      const item = this.items.find(item => item.cart_item_id === cartItemId);
      if (item) {
        item.selected = !item.selected;
      }
    },

    clearError() {
      this.error = null;
    },
  },
});