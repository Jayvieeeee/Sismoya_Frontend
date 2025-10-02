// stores/cart.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface CartItem {
  id: number
  type: string
  liters: number
  price: number
  qty: number
  image_url: string
  selected?: boolean
}



export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  // Load cart from localStorage
  const loadFromStorage = () => {
    const saved = localStorage.getItem('cart')
    if (saved) {
      try {
        items.value = JSON.parse(saved)
      } catch (error) {
        console.error('Failed to load cart from storage:', error)
        items.value = []
      }
    }
  }

  // Save cart to localStorage
  const saveToStorage = () => {
    localStorage.setItem('cart', JSON.stringify(items.value))
  }
  

  // Add to cart
  const addToCart = (product: CartItem) => {
    const existing = items.value.find(item => item.id === product.id)
    if (existing) {
      existing.qty += product.qty
    } else {
      items.value.push({ ...product, selected: true })
    }
    saveToStorage()
  }

  const addItem = (product: CartItem) => {
  addToCart(product)
}

  // Remove from cart
  const removeFromCart = (id: number) => {
    const index = items.value.findIndex(item => item.id === id)
    if (index !== -1) {
      items.value.splice(index, 1)
      saveToStorage()
    }
  }

  // Update quantity
  const updateQuantity = (id: number, newQty: number) => {
    const item = items.value.find(item => item.id === id)
    if (item && newQty > 0) {
      item.qty = newQty
      saveToStorage()
    }
  }

  // Toggle selection
  const toggleSelect = (id: number) => {
    const item = items.value.find(item => item.id === id)
    if (item) {
      item.selected = !item.selected
      saveToStorage()
    }
  }

  // Clear cart
  const clearCart = () => {
    items.value = []
    localStorage.removeItem('cart')
  }

  // Select all / deselect all
  const toggleSelectAll = (select: boolean) => {
    items.value.forEach(item => {
      item.selected = select
    })
    saveToStorage()
  }

  // Get selected items
  const selectedItems = computed(() => 
    items.value.filter(item => item.selected)
  )

  // Total items count
  const totalItems = computed(() => 
    items.value.reduce((sum, item) => sum + item.qty, 0)
  )

  // Total price
  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + (item.price * item.qty), 0)
  )

  // Selected total price
  const selectedTotalPrice = computed(() =>
    selectedItems.value.reduce((sum, item) => sum + (item.price * item.qty), 0)
  )

return {
  items,
  loadFromStorage,
  addToCart,
  addItem, // Add this line
  removeFromCart,
  updateQuantity,
  toggleSelect,
  toggleSelectAll,
  clearCart,
  selectedItems,
  totalItems,
  totalPrice,
  selectedTotalPrice
}
})