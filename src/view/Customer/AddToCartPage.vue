<script setup lang="ts">
import { computed, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useCartStore } from "@/stores/cart"
import Cart from '@/assets/icons/cart.png'
import plusIcon from '@/assets/icons/plus.png'
import minusIcon from '@/assets/icons/minus.png'
import CustomerLayout from "@/Layout/CustomerLayout.vue"

const router = useRouter()
const cartStore = useCartStore()

// Load cart from BACKEND instead of localStorage
onMounted(async () => {
  await cartStore.loadFromBackend()
})

const cartItems = computed(() => cartStore.items)

function toggleSelect(item: any) {
  // Use cart_item_id from backend instead of id
  cartStore.toggleSelect(item.cart_item_id || item.id)
}

function checkout() {
  const selectedItems = cartItems.value.filter(item => item.selected)
  if (selectedItems.length === 0) {
    alert("Please select at least one item to checkout")
    return
  }
  alert(`✅ Proceeding to checkout with ${selectedItems.length} items...`)
  // You can add your checkout logic here
}

// Updated to use backend functions - FIXED: Only pass cartItemId
async function increaseQty(item: any) {
  await cartStore.updateQuantity(
    item.cart_item_id || item.id, 
    item.quantity + 1
  )
}

// Updated to use backend functions - FIXED: Only pass cartItemId
async function decreaseQty(item: any) {
  const currentQty = item.quantity || item.qty
  if (currentQty > 1) {
    await cartStore.updateQuantity(
      item.cart_item_id || item.id,
      currentQty - 1
    )
  } else {
    if (confirm(`Remove ${item.type} from cart?`)) {
      await cartStore.removeFromCart([item.cart_item_id || item.id])
    }
  }
}

// Use quantity instead of qty
const total = computed(() =>
  cartItems.value
    .filter(item => item.selected)
    .reduce((sum, item) => sum + (item.price || 0) * (item.quantity || item.qty || 0), 0)
)

const selectedCount = computed(() =>
  cartItems.value.filter(item => item.selected).length
)

function goBack() {
  router.back()
}

// Function to format image URL - FIXED: Handle undefined
function getImageUrl(imageUrl: string | undefined): string {
  if (!imageUrl) return ''
  if (imageUrl.startsWith('/')) {
    return `https://sismoya.com/api${imageUrl}`
  }
  return imageUrl
}

// Properly typed image error handler
function handleImageError(event: Event) {
  const target = event.target as HTMLImageElement
  const fallbackElement = target.nextElementSibling as HTMLElement
  
  if (target && fallbackElement) {
    target.style.display = 'none'
    fallbackElement.style.display = 'block'
  }
}
</script>

<template>
  <CustomerLayout>
    <div class="flex min-h-screen">
      <!-- Main Content -->
      <div class="flex-1 p-8">
        <!-- Title -->
        <div class="flex items-center gap-3 mb-8">
          <span 
            @click="goBack"
            class="cursor-pointer text-5xl hover:text-secondary transition"
          >
            ←
          </span>
          <h2 class="text-3xl font-bold text-[#2E78A6]">Cart</h2>
          <img :src="Cart" alt="Cart" class="w-8 h-8 -scale-x-100" />
        </div>

        <!-- Centered Card -->
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
              :key="item.cart_item_id || item.id"
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
                    <p class="text-medium"><span class="font-semibold">Type: </span>{{ item.type }}</p>
                    <p class="text-medium"><span class="font-semibold">Liters:</span> {{ item.liters }}</p>
                    <p class="text-medium"><span class="font-semibold">Price: </span> ₱{{ (item.price || 0).toFixed(2) }}</p>

                    <!-- Qty controls -->
                    <div class="flex items-center gap-3 mt-3">
                      <button
                        @click="decreaseQty(item)"
                        class="w-8 h-8 flex items-center justify-center rounded-full  hover:bg-gray-300 transition"
                      >
                        <img :src="minusIcon" alt="minus" class="w-3 h-3" />
                      </button>
                      <!-- Use quantity from backend -->
                      <span class="font-semibold w-8 text-center">{{ item.quantity || item.qty }}</span>
                      <button
                        @click="increaseQty(item)"
                        class="w-8 h-8 flex items-center justify-center rounded-full  hover:bg-gray-300 transition"
                      >
                        <img :src="plusIcon" alt="plus" class="w-3 h-3" />
                      </button>
                    </div>

                    <!-- Item Total -->
                    <p class="text-sm mt-2">
                      <!-- Use quantity from backend -->
                      Item Total: ₱{{ ((item.price || 0) * (item.quantity || item.qty || 0)).toFixed(2) }}
                    </p>
                  </div>

                  <div class="w-24 h-24 rounded-lg flex items-center justify-center flex-shrink-0 ">
                    <img
                      :src="getImageUrl(item.image_url)"
                      :alt="item.type"
                      class="w-20 h-20 object-contain"
                      @error="handleImageError"
                    />
                    <div class="hidden text-gray-400 text-xs text-center">
                      No image
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Total + Checkout -->
            <div class="flex justify-between items-center mt-8 pt-6 px-6">
              <div>
                <p class="font-based text-medium text-gray-800">
                  Total Amount: ₱{{ total.toFixed(2) }}
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