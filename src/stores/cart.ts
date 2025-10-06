import { defineStore } from "pinia"
import {
  getUserCart,
  addToCartBackend,
  updateCartItemBackend,
  removeFromCartBackend,
  clearSelectedItemsBackend
} from "@/api/cartApi"
import type { CartItem } from "@/api/cartApi"

export const useCartStore = defineStore("cart", {
  state: () => ({
    items: [] as CartItem[],
    loading: false,
    error: null as string | null
  }),

  getters: {
    totalItems: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: (state) => state.items.reduce((sum, item) => sum + item.total_price, 0),
    isEmpty: (state) => state.items.length === 0,

    // For UI display
    itemsForDisplay: (state) =>
      state.items.map((item) => ({
        ...item,
        type: item.name,
        liters: parseFloat(item.size) || 0,
        qty: item.quantity,
        selected: item.selected || false
      }))
  },

  actions: {
    // 🟢 Load cart from backend
    async loadFromBackend() {
      this.loading = true
      this.error = null
      try {
        console.log("🔄 Loading cart from backend...")
        const backendItems = await getUserCart()
        this.items = Array.isArray(backendItems) ? backendItems : []
        console.log(`✅ Loaded ${this.items.length} items into cart:`, this.items)
      } catch (err: any) {
        this.error = err.message || "Failed to load cart"
        this.items = []
        console.error("❌ Failed to load cart:", err)
      } finally {
        this.loading = false
      }
    },

    // 🟢 Add to cart with detailed logging
    async addToCart(gallon_id: number, quantity: number = 1) {
      this.loading = true
      this.error = null
      try {
        console.log(`🛒 Adding to cart: gallon_id=${gallon_id}, quantity=${quantity}`)
        
        // Check current state before adding
        const existingItem = this.items.find(item => item.gallon_id === gallon_id)
        console.log(`📊 Before add - Existing item:`, existingItem)
        
        const updatedCart = await addToCartBackend(gallon_id, quantity)
        this.items = Array.isArray(updatedCart) ? updatedCart : []
        
        // Check result after adding
        const newItem = this.items.find(item => item.gallon_id === gallon_id)
        console.log(`📊 After add - New item state:`, newItem)
        console.log(`✅ Cart updated (${this.items.length} items, ${this.totalItems} total quantity)`)
        
      } catch (err: any) {
        this.error = err.message || "Failed to add to cart"
        console.error("❌ Failed to add to cart:", err)
      } finally {
        this.loading = false
      }
    },

    // 🟢 Remove items
    async removeFromCart(cartItemIds: number[]) {
      this.loading = true
      try {
        console.log(`🗑️ Removing items:`, cartItemIds)
        await removeFromCartBackend(cartItemIds)
        await this.loadFromBackend()
      } catch (err: any) {
        this.error = err.message || "Failed to remove from cart"
        console.error("❌ Failed to remove from cart:", err)
        throw err
      } finally {
        this.loading = false
      }
    },

    // 🟢 Update quantity
    async updateQuantity(cartItemId: number, quantity: number) {
      this.loading = true
      try {
        console.log(`🔄 Updating quantity: cartItemId=${cartItemId}, quantity=${quantity}`)
        const updatedCart = await updateCartItemBackend(cartItemId, quantity)
        this.items = Array.isArray(updatedCart) ? updatedCart : []
        console.log(`✅ Quantity updated`)
      } catch (err: any) {
        this.error = err.message || "Failed to update quantity"
        console.error("❌ Failed to update quantity:", err)
        throw err
      } finally {
        this.loading = false
      }
    },

    // 🟢 Clear selected items (bulk)
    async clearSelectedItems() {
      const selectedIds = this.items.filter(i => i.selected).map(i => i.cart_item_id)
      if (selectedIds.length === 0) return
      this.loading = true
      try {
        console.log(`🧹 Clearing selected items:`, selectedIds)
        await clearSelectedItemsBackend(selectedIds)
        await this.loadFromBackend()
      } catch (err: any) {
        this.error = err.message || "Failed to clear selected items"
        console.error("❌ Failed to clear selected items:", err)
      } finally {
        this.loading = false
      }
    },

    // 🟢 Toggle select item in UI
    toggleSelect(cartItemId: number) {
      const item = this.items.find((i) => i.cart_item_id === cartItemId)
      if (item) item.selected = !item.selected
    },

    clearError() {
      this.error = null
    }
  }
})