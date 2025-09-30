<script setup lang="ts">
import { computed } from "vue"
import { useRouter } from "vue-router"
import { useCartStore } from "@/stores/cart"
import Sidebar from '@/components/CustomerSidebar.vue'
import Cart from '@/assets/icons/cart.png'
import plusIcon from '@/assets/icons/plus.png'
import minusIcon from '@/assets/icons/minus.png'

const router = useRouter()
const cartStore = useCartStore()
const cartItems = cartStore.items

function toggleSelect(item: any) {
  item.selected = !item.selected
}

function checkout() {
  alert("✅ Proceeding to checkout...")
}

function increaseQty(item: any) {
  item.qty++
}

function decreaseQty(item: any) {
  if (item.qty > 1) item.qty--
}

const total = computed(() =>
  cartItems
    .filter(item => item.selected)
    .reduce((sum, item) => sum + item.price * item.qty, 0)
)
function goBack() {
  router.back()
}

</script>

<template>
  <div class="flex min-h-screen">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Content -->
    <div class="flex-1 p-8 bg-gradient-to-b from-[#e6f3fb] to-[#b9ddf3]">
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
      <div class="max-w-3xl mx-auto bg-white rounded-2xl shadow-md p-6">
        <!-- Cart Items -->
        <div
          v-for="item in cartItems"
          :key="item.id"
          class="flex justify-between items-center border-b last:border-none py-4"
        >
          <!-- Left Info -->
          <div class="flex items-start gap-4">
            <!-- Select Checkbox -->
            <span
              class="w-6 h-6 flex items-center justify-center rounded-full border-2 border-gray-700 text-gray-700 cursor-pointer"
              @click="toggleSelect(item)"
            >
              <span v-if="item.selected">✓</span>
            </span>

            <div>
              <p class="font-semibold">Type: {{ item.type }}</p>
              <p>Liters: {{ item.liters }}</p>
              <p>Price: ₱{{ item.price.toFixed(2) }}</p>

              <!-- Qty controls -->
              <div class="flex items-center gap-3 mt-2">
                <button
                  @click="decreaseQty(item)"
                  class="p-1 rounded-full hover:bg-gray-200 transition"
                >
                  <img :src="minusIcon" alt="minus" class="w-4 h-4" />
                </button>
                <span class="font-semibold">{{ item.qty }}</span>
                <button
                  @click="increaseQty(item)"
                  class="p-1 rounded-full hover:bg-gray-200 transition"
                >
                  <img :src="plusIcon" alt="plus" class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- Image -->
          <img
            :src="item.image_url"
            alt="container"
            class="w-20 h-20 object-contain"
          />
        </div>

        <!-- Total + Checkout -->
        <div class="flex justify-between items-center mt-6">
          <p class="font-semibold text-lg">
            Total Amount: ₱{{ total.toFixed(2) }}
          </p>
          <button
            @click="checkout"
            :disabled="total === 0"
            class="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
