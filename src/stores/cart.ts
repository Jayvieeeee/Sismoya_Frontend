import { defineStore } from "pinia"

export interface CartItem {
  id: number
  type: string
  liters: number
  price: number
  qty: number
  image_url?: string   // optional image field
  selected?: boolean   // optional selected field
}

export const useCartStore = defineStore("cart", {
  state: () => ({
    items: [] as CartItem[]
  }),
  actions: {
    addItem(item: CartItem) {
      // if item already exists, increase qty
      const existing = this.items.find(i => i.id === item.id)
      if (existing) {
        existing.qty += item.qty
      } else {
        this.items.push({ ...item, selected: false }) // default selected = false
      }
    },
    clearCart() {
      this.items = []
    }
  }
})
