<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import Swal from "sweetalert2"
import Cart from '@/assets/icons/cart.png'
import plusIcon from '@/assets/icons/plus.png'
import minusIcon from '@/assets/icons/minus.png'
import trashIcon from '@/assets/icons/trash.png'
import CustomerLayout from "@/Layout/CustomerLayout.vue"

import type { CartItem } from '@/api/cartApi'
import {
  getUserCart,
  updateCartItemBackend,
  removeFromCartBackend,
  clearSelectedItemsBackend
} from '@/api/cartApi'

const IMAGE_BASE_URL = 'https://sismoya.com/api'
const router = useRouter()

const items = ref<CartItem[]>([])
const imageErrors = ref<Set<number>>(new Set())

const cartItems = computed(() => items.value)
const selectedItems = computed(() => cartItems.value.filter(item => item.selected))
const selectedCount = computed(() => selectedItems.value.length)
const totalPrice = computed(() =>
  selectedItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
)
const isEmpty = computed(() => cartItems.value.length === 0)

onMounted(async () => {
  items.value = await getUserCart()
})

const toggleSelect = (item: CartItem) => {
  item.selected = !item.selected
}

const checkout = async () => {
  if (selectedCount.value === 0) {
    await Swal.fire({
      icon: "info",
      title: "No items selected",
      text: "Please select at least one item to checkout.",
      confirmButtonColor: "#3085d6"
    })
    return
  }

  await Swal.fire({
    icon: "success",
    title: "Proceeding to Checkout",
    text: `You selected ${selectedCount.value} item${selectedCount.value > 1 ? "s" : ""}.`,
    confirmButtonColor: "#3085d6"
  })
}

const updateQuantity = async (item: CartItem, newQuantity: number) => {
  if (newQuantity <= 0) {
    const result = await Swal.fire({
      icon: "warning",
      title: "Remove Item?",
      text: `Do you want to remove ${item.name} from the cart?`,
      showCancelButton: true,
      confirmButtonText: "Yes, remove it",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6"
    })

    if (result.isConfirmed) {
      await removeFromCartBackend([item.cart_item_id])
      items.value = await getUserCart()
      await Swal.fire({
        icon: "success",
        title: "Item Removed",
        text: `${item.name} has been removed.`,
        timer: 1500,
        showConfirmButton: false
      })
    }
    return
  }

  items.value = await updateCartItemBackend(item.cart_item_id, newQuantity)
}

const increaseQty = (item: CartItem) => updateQuantity(item, item.quantity + 1)
const decreaseQty = (item: CartItem) => updateQuantity(item, item.quantity - 1)

const removeItem = async (item: CartItem) => {
  const result = await Swal.fire({
    icon: "warning",
    title: "Remove Item?",
    text: `Do you want to remove ${item.name} from your cart?`,
    showCancelButton: true,
    confirmButtonText: "Yes, remove it",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6"
  })

  if (result.isConfirmed) {
    await removeFromCartBackend([item.cart_item_id])
    items.value = await getUserCart()
    await Swal.fire({
      icon: "success",
      title: "Removed!",
      text: `${item.name} has been removed from the cart.`,
      timer: 1500,
      showConfirmButton: false
    })
  }
}

const removeSelected = async () => {
  if (selectedCount.value === 0) return
  const result = await Swal.fire({
    icon: "warning",
    title: "Remove Selected Items?",
    text: `Are you sure you want to remove ${selectedCount.value} selected items?`,
    showCancelButton: true,
    confirmButtonText: "Yes, remove them",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6"
  })

  if (result.isConfirmed) {
    const ids = selectedItems.value.map(i => i.cart_item_id)
    await clearSelectedItemsBackend(ids)
    items.value = await getUserCart()
    await Swal.fire({
      icon: "success",
      title: "Removed!",
      text: "Selected items have been removed.",
      timer: 1500,
      showConfirmButton: false
    })
  }
}

const getImageUrl = (item: CartItem): string => {
  if (!item.image_url) return ""
  const urlMappings = [
    { test: (url: string) => url.startsWith("images/"), transform: (url: string) => `${IMAGE_BASE_URL}/${url}` },
    { test: (url: string) => url.startsWith("/images/"), transform: (url: string) => `${IMAGE_BASE_URL}${url}` },
    { test: (url: string) => !url.startsWith("http"), transform: (url: string) => `${IMAGE_BASE_URL}/images/${url}` }
  ]
  const mapping = urlMappings.find(mapping => mapping.test(item.image_url))
  const finalUrl = mapping ? mapping.transform(item.image_url) : item.image_url
  return `${finalUrl}?t=${Date.now()}`
}

const hasImageError = (item: CartItem): boolean => imageErrors.value.has(item.cart_item_id)
const handleImageError = (_event: Event, item: CartItem) => imageErrors.value.add(item.cart_item_id)
const handleImageLoad = (_event: Event, item: CartItem) => imageErrors.value.delete(item.cart_item_id)

const goBack = () => router.back()
const formatPrice = (price: number): string => price.toFixed(2)
const getDisplayText = (value: any, fallback: string = "N/A"): string => value || fallback
</script>



<template>
  <CustomerLayout>
    <div class="flex min-h-screen">
      <div class="flex-1 p-8">
        <!-- Header -->
        <div class="flex items-center gap-3 mb-8">
          <span 
            @click="goBack"
            class="cursor-pointer text-5xl hover:text-secondary transition"
            aria-label="Go back"
          >
            ←
          </span>
          <h1 class="text-3xl font-bold text-[#2E78A6]">Shopping Cart</h1>
          <img :src="Cart" alt="Cart" class="w-8 h-8 -scale-x-100" />
        </div>

        <!-- Main Content -->
        <div class="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6">
          <!-- Empty State -->
          <div v-if="isEmpty" class="text-center py-12">
            <div class="text-gray-400 mb-4">
              <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-gray-600 mb-2">Your cart is empty</h2>
            <p class="text-gray-500 mb-6">Add some items to get started</p>
            <button 
              @click="router.push('/customerDashboard')"
              class="bg-primary text-white px-6 py-3 rounded-lg hover:bg-secondary transition-colors font-medium"
            >
              Continue Shopping
            </button>
          </div>

          <!-- Cart Items -->
          <div v-else>
          <div
            v-for="item in cartItems"
            :key="item.cart_item_id"
            class="flex items-center justify-between gap-4 p-4 border-b border-b-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors"
          >

            <!-- Left side: select + details -->
            <div class="flex items-start gap-4 flex-1">
              <!-- Selection Toggle -->
              <button
                @click="toggleSelect(item)"
                class="w-6 h-6 flex items-center justify-center rounded-full border-2 transition-colors flex-shrink-0"
                :class="item.selected 
                  ? 'bg-primary border-primary text-white' 
                  : 'border-gray-300 text-transparent hover:border-primary'"
                :aria-label="item.selected ? 'Deselect item' : 'Select item'"
              >
                ✓
              </button>

              <!-- Product Details -->
              <div class="flex-1 min-w-0">
                <h3 class=" text-sm truncate"><span class="font-semibold">Type: </span>{{ getDisplayText(item.name) }}</h3>
                <p class="text-sm"><span class="font-semibold">Size: </span>{{ getDisplayText(item.size) }}</p>
                <p class="text-sm"><span class="font-semibold">Price: ₱ </span>{{ formatPrice(item.price) }}</p>
                
                <!-- Quantity Controls -->
                <div class="flex items-center gap-3 mt-2">
                  <button
                    @click="decreaseQty(item)"
                    class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <img :src="minusIcon" alt="Decrease" class="w-3 h-3" />
                  </button>
                  <span class="font-semibold text-gray-900 w-8 text-center">{{ item.quantity }}</span>
                  <button
                    @click="increaseQty(item)"
                    class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <img :src="plusIcon" alt="Increase" class="w-3 h-3" />
                  </button>
                </div>

                <!-- Item Total -->
                <p class="text-sm font-medium text-gray-900 mt-2">
                  Total: ₱{{ formatPrice(item.price * item.quantity) }}
                </p>
              </div>
            </div>

          <!-- Right side: product image + remove -->
          <div class="flex items-center gap-2 mr-12">
            <img
              v-if="!hasImageError(item)"
              :src="getImageUrl(item)"
              @error="handleImageError($event, item)"
              @load="handleImageLoad($event, item)"
              alt="Product"
              class="w-20 h-20 object-contain"
            />
            <button
              @click="removeItem(item)"
              class="p-2 bg-red-100 hover:bg-red-200 rounded-full transition"
              aria-label="Remove item"
            >
              <img :src="trashIcon" alt="Remove" class="w-4 h-4" />
            </button>
          </div>
        </div>


            <!-- Checkout Section -->
            <div class="mt-8 pt-6">
              <div class="flex justify-between items-center">
                <div>
                  <p class="text-lg font-semibold text-gray-900">
                    Total Amount: ₱{{ formatPrice(totalPrice) }}
                  </p>
                  <p v-if="selectedCount > 0" class="text-sm text-gray-500 mt-1">
                    {{ selectedCount }} item{{ selectedCount !== 1 ? 's' : '' }} selected
                  </p>
                </div>
                <button
                  @click="checkout"
                  :disabled="selectedCount === 0"
                  class="bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-8 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <span>Checkout</span>
                  <span v-if="selectedCount > 0"  class="text-white rounded-full border-2 border-white w-6 h-6 flex items-center justify-center text-sm">
                    {{ selectedCount }}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </CustomerLayout>
</template>