<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useCartStore } from "@/stores/cart"
import Sidebar from "@/components/CustomerSidebar.vue"
import OrderModal from "@/components/OrderModal.vue"
import Cart from "@/assets/icons/cart.png"
import { getContainers } from "@/api/getContainer"
import type { ModalProduct } from "@/types" 
import OrderSummaryModal from "@/components/OrderSummaryModal.vue"

const modalAction = ref<"cart" | "order">("cart")
const router = useRouter()
const cartStore = useCartStore()
const showSummaryModal = ref(false)

const containers = ref<ModalProduct[]>([])
const showModal = ref(false)
const selectedProduct = ref<ModalProduct>({
  id: 0,
  type: "",
  liters: 0,
  price: 0,
  qty: 1,
  image_url: "",
})

// ✅ Fetch containers from backend
onMounted(async () => {
  containers.value = await getContainers()
})

// Navigation
function goToAddToCartPage() {
  router.push("/customerCart")
}

// Modal controls
function openModal(product: ModalProduct, action: "cart" | "order") {
  selectedProduct.value = { ...product }
  modalAction.value = action
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

// Add to cart
function handleAddMore(item: ModalProduct) {
  cartStore.addToCart({
    id: item.id,
    type: item.type,
    liters: item.liters,
    price: item.price,
    qty: item.qty,
    image_url: item.image_url || "" // Provide fallback for undefined
  })
  showModal.value = false
}

// Direct order
function handleOrderNow(item: ModalProduct) {
  selectedProduct.value = { ...item }
  showModal.value = false
  showSummaryModal.value = true
}

// Handle order success
function handleOrderSuccess() {
  showSummaryModal.value = false
  // Add any success logic here, like showing a success message
  console.log("Order placed successfully!")
}

</script>

<template>
  <div class="font-Montserrat flex bg-gradient-to-b from-white to-secondary">
    <Sidebar />

    <div class="flex-1 p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6 p-12">
        <h2 class="text-4xl font-medium text-primary">Gallon</h2>
        <img
          :src="Cart"
          @click="goToAddToCartPage"
          alt="Cart"
          class="w-10 h-10 cursor-pointer transition-transform -scale-x-100"
        />
      </div>

      <!-- ✅ Container Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div
          v-for="container in containers"
          :key="container.id"
          class="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center max-w-xs mx-auto"
        >
          <!-- ✅ Image from backend -->
          <img
            :src="`https://sismoya.com/api${container.image_url}`"
            :alt="container.type"
            class="w-40 h-40 object-contain mb-4"
          />

          <p class="font-medium">Type: {{ container.type }}</p>
          <p>Liters: {{ container.liters }} liters</p>
          <p>Price: ₱{{ container.price.toFixed(2) }}</p>

          <div class="flex gap-3 mt-4">
            <button
              @click="openModal(container, 'cart')"
              class="bg-primary text-white px-4 py-2 rounded-full hover:bg-secondary transition"
            >
              Add to Cart
            </button>

            <button
              @click="openModal(container, 'order')"
              class="bg-primary text-white px-4 py-2 rounded-full hover:bg-secondary transition"
            >
              Order Now
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal -->
  <OrderModal
    :isOpen="showModal"
    :product="selectedProduct"
    :action="modalAction"
    @close="closeModal"
    @add-more="handleAddMore"
    @order-now="handleOrderNow"
  />

  <!-- Order Summary Modal -->
  <OrderSummaryModal
    :isOpen="showSummaryModal"
    :products="[selectedProduct]" 
    @close="showSummaryModal = false"
    @place-order="handleOrderSuccess"
  />
</template>