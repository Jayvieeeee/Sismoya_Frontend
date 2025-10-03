<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import { useCartStore } from "@/stores/cart"
import Cart from '@/assets/icons/cart.png'
import plusIcon from '@/assets/icons/plus.png'
import minusIcon from '@/assets/icons/minus.png'
import CustomerLayout from "@/Layout/CustomerLayout.vue"

const router = useRouter()
const cartStore = useCartStore()
const imageErrors = ref<Set<number>>(new Set())

// Load cart from backend
onMounted(async () => {
  await cartStore.loadFromBackend()
})

// Use itemsForDisplay getter which maps backend fields to frontend fields
const cartItems = computed(() => cartStore.itemsForDisplay)

function toggleSelect(item: any) {
  cartStore.toggleSelect(item.cart_item_id)
}

function checkout() {
  const selectedItems = cartItems.value.filter(item => item.selected)
  if (selectedItems.length === 0) {
    alert("Please select at least one item to checkout")
    return
  }
  alert(`✅ Proceeding to checkout with ${selectedItems.length} items...`)
}

async function increaseQty(item: any) {
  await cartStore.updateQuantity(item.cart_item_id, item.quantity + 1)
}

async function decreaseQty(item: any) {
  const currentQty = item.quantity
  if (currentQty > 1) {
    await cartStore.updateQuantity(item.cart_item_id, currentQty - 1)
  } else {
    if (confirm(`Remove ${item.type} from cart?`)) {
      await cartStore.removeFromCart([item.cart_item_id])
    }
  }
}

const total = computed(() =>
  cartItems.value
    .filter(item => item.selected)
    .reduce((sum, item) => sum + (item.price * item.quantity), 0)
)

const selectedCount = computed(() =>
  cartItems.value.filter(item => item.selected).length
)

function goBack() {
  router.back()
}

// Improved image URL handling
function getImageUrl(item: any): string {
  if (!item.image_url) {
    return '' // Return empty string for missing images
  }
  
  let imageUrl = item.image_url
  
  // Ensure the URL is properly formatted
  if (imageUrl.startsWith('/')) {
    imageUrl = `https://sismoya.com/api${imageUrl}`
  }
  
  // Add cache busting to prevent cached broken images
  const timestamp = new Date().getTime()
  return `${imageUrl}?t=${timestamp}`
}

// Check if image has error
function hasImageError(item: any): boolean {
  return imageErrors.value.has(item.cart_item_id)
}

// Handle image load errors
function handleImageError(event: Event, item: any) {
  const target = event.target as HTMLImageElement
  console.warn(`❌ Image failed to load for item ${item.cart_item_id}:`, item.image_url)
  
  // Add to error set
  imageErrors.value.add(item.cart_item_id)
  
  // Hide the broken image
  target.style.display = 'none'
  
  // Show fallback
  const fallback = target.nextElementSibling as HTMLElement
  if (fallback) {
    fallback.style.display = 'flex'
  }
}

// Handle successful image load
function handleImageLoad(event: Event, item: any) {
  const target = event.target as HTMLImageElement
  console.log(`✅ Image loaded successfully for item ${item.cart_item_id}`)
  
  // Remove from error set if it was there before
  imageErrors.value.delete(item.cart_item_id)
}

function formatPrice(price: number): string {
  return price.toFixed(2)
}
</script>

<template>
  <CustomerLayout>
    <div class="flex min-h-screen">
      <div class="flex-1 p-8">
        <!-- Title -->
        <div class="flex items-center gap-3 mb-8">
          <span @click="goBack" class="cursor-pointer text-5xl hover:text-secondary transition">←</span>
          <h2 class="text-3xl font-bold text-[#2E78A6]">Cart</h2>
          <img :src="Cart" alt="Cart" class="w-8 h-8 -scale-x-100" />
        </div>

        <!-- Debug Info -->
        <div v-if="cartStore.loading" class="mb-4 p-3 bg-blue-100 text-blue-800 rounded">
          🔄 Loading cart...
        </div>
        <div v-if="cartStore.error" class="mb-4 p-3 bg-red-100 text-red-800 rounded">
          ❌ {{ cartStore.error }}
        </div>

        <div class="max-w-4xl mx-auto bg-white rounded-2xl shadow-md p-6">
          <!-- Empty State -->
          <div v-if="cartItems.length === 0" class="text-center py-12">
            <div class="text-gray-400 mb-4">
              <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-600 mb-2">Your cart is empty</h3>
            <p class="text-gray-500 mb-4">Add some items to get started</p>
            <button 
              @click="router.push('/customerDashboard')"
              class="bg-primary text-white px-6 py-2 rounded-lg hover:bg-secondary transition"
            >
              Continue Shopping
            </button>
          </div>

          <!-- Cart Items -->
          <div v-else>
            <div
              v-for="item in cartItems"
              :key="item.cart_item_id"
              class="flex justify-between items-center border-b py-6 hover:bg-gray-50 transition-colors"
            >
              <!-- Left Info -->
              <div class="flex items-center gap-4 flex-1 px-12">
                <!-- Select Checkbox -->
                <span
                  class="w-6 h-6 flex items-center justify-center rounded-full border-2 border-gray-700 text-gray-700 cursor-pointer mt-1 flex-shrink-0"
                  :class="item.selected ? 'bg-primary border-primary text-white' : 'border-gray-400'"
                  @click="toggleSelect(item)"
                >
                  <span v-if="item.selected">✓</span>
                </span>

                <div class="flex gap-6 flex-1 items-center">
                  <!-- Product Details -->
                  <div class="flex-1">
                    <p class="text-medium"><span class="font-semibold">Type: </span>{{ item.type || 'Unknown' }}</p>
                    <p class="text-medium"><span class="font-semibold">Liters:</span> {{ item.liters || 'N/A' }}</p>
                    <p class="text-medium"><span class="font-semibold">Price: </span> ₱{{ formatPrice(item.price) }}</p>

                    <!-- Qty controls -->
                    <div class="flex items-center gap-3 mt-3">
                      <button @click="decreaseQty(item)" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-300 transition">
                        <img :src="minusIcon" alt="minus" class="w-3 h-3" />
                      </button>
                      <span class="font-semibold w-8 text-center">{{ item.quantity }}</span>
                      <button @click="increaseQty(item)" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-300 transition">
                        <img :src="plusIcon" alt="plus" class="w-3 h-3" />
                      </button>
                    </div>

                    <!-- Item Total -->
                    <p class="text-sm mt-2">
                      Item Total: ₱{{ formatPrice(item.price * item.quantity) }}
                    </p>
                  </div>

                  <!-- Image Container -->
                  <div class="w-24 h-24 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-100 relative">
                    <!-- Product Image -->
                    <img
                      v-if="item.image_url && !hasImageError(item)"
                      :src="getImageUrl(item)"
                      :alt="item.type"
                      class="w-20 h-20 object-contain"
                      @error="(e) => handleImageError(e, item)"
                      @load="(e) => handleImageLoad(e, item)"
                    />
                    
                    <!-- Fallback when image fails to load -->
                    <div 
                      v-else
                      class="flex flex-col items-center justify-center text-gray-400"
                    >
                      <svg class="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      <span class="text-xs">No image</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Total + Checkout -->
            <div class="flex justify-between items-center mt-8 pt-6 px-6">
              <div>
                <p class="font-based text-medium text-gray-800">
                  Total Amount: ₱{{ formatPrice(total) }}
                </p>
                <p class="text-xs text-gray-500 mt-1" v-if="selectedCount > 0">
                  {{ selectedCount }} selected item(s)
                </p>
              </div>
              <div class="flex gap-3">
                <button
                  @click="checkout"
                  :disabled="selectedCount === 0"
                  class="bg-button hover:bg-orange-600 text-white font-medium py-2 px-8 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Checkout ({{ selectedCount }})
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </CustomerLayout>
</template>