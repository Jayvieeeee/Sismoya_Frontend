// stores/cart.ts - SIMPLE VERSION
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getUserCart, addToCartBackend, removeFromCartBackend } from '@/api/cartApi'

export interface CartItem {
  cart_item_id?: number
  gallon_id: number
  id?: number
  type?: string
  liters?: number
  price?: number
  quantity: number
  qty?: number
  total_price?: number
  image_url?: string
  selected?: boolean
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  // Load cart from BACKEND
  const loadFromBackend = async () => {
    try {
      const backendItems = await getUserCart()
      items.value = backendItems.map(item => ({
        ...item,
        selected: false
      }))
    } catch (error) {
      console.error('Failed to load cart from backend:', error)
      items.value = []
    }
  }

  // SIMPLE VERSION: Only accept gallonId and quantity
  const addToCart = async (gallonId: number, quantity: number = 1) => {
    try {
      const result = await addToCartBackend(gallonId, quantity)
      await loadFromBackend()
      return result
    } catch (error) {
      console.error('Failed to add to cart:', error)
      throw error
    }
  }

  // Remove from cart via BACKEND
  const removeFromCart = async (cartItemIds: number[]) => {
    try {
      await removeFromCartBackend(cartItemIds)
      await loadFromBackend()
    } catch (error) {
      console.error('Failed to remove from cart:', error)
      throw error
    }
  }

  // Update quantity via backend
  const updateQuantity = async (cartItemId: number, newQuantity: number) => {
    try {
      if (newQuantity <= 0) {
        await removeFromCart([cartItemId])
      } else {
        const item = items.value.find(item => (item.cart_item_id || item.id) === cartItemId)
        if (item) {
          await removeFromCart([cartItemId])
          await addToCart(item.gallon_id, newQuantity)
        }
      }
    } catch (error) {
      console.error('Failed to update quantity:', error)
      throw error
    }
  }

  // Toggle selection (frontend only)
  const toggleSelect = (cartItemId: number) => {
    const item = items.value.find(item => (item.cart_item_id || item.id) === cartItemId)
    if (item) {
      item.selected = !item.selected
    }
  }

  // Clear cart
  const clearCart = async () => {
    try {
      const allItemIds = items.value.map(item => item.cart_item_id!).filter(Boolean)
      if (allItemIds.length > 0) {
        await removeFromCartBackend(allItemIds)
      }
      items.value = []
    } catch (error) {
      console.error('Failed to clear cart:', error)
      throw error
    }
  }

  // Select all / deselect all (frontend only)
  const toggleSelectAll = (select: boolean) => {
    items.value.forEach(item => {
      item.selected = select
    })
  }

  // Get selected items
  const selectedItems = computed(() => 
    items.value.filter(item => item.selected)
  )

  // Total items count
  const totalItems = computed(() => 
    items.value.reduce((sum, item) => sum + (item.quantity || item.qty || 0), 0)
  )

  // Total price
  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || item.qty || 0)), 0)
  )

  // Selected total price
  const selectedTotalPrice = computed(() =>
    selectedItems.value.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || item.qty || 0)), 0)
  )

  // Selected count
  const selectedCount = computed(() =>
    selectedItems.value.length
  )

  return {
    items,
    loadFromBackend,
    addToCart,
    removeFromCart,
    updateQuantity,
    toggleSelect,
    toggleSelectAll,
    clearCart,
    selectedItems,
    totalItems,
    totalPrice,
    selectedTotalPrice,
    selectedCount
  }
})