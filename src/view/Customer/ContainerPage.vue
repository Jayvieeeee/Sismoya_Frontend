<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import { useRouter } from "vue-router"
import Swal from 'sweetalert2'
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

// Store the product with selected quantity for immediate ordering
const productForImmediateOrder = ref<ModalProduct | null>(null)

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
  selectedProduct.value = { ...product, qty: 1 } // Reset quantity to 1 when opening modal
  modalAction.value = action
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  productForImmediateOrder.value = null // Reset when closing modal
}

// Add to cart - adds to cart store
async function handleAddMore(item: ModalProduct) {
  try {
    await cartStore.addToCart(item.id, item.qty)

    // ✅ Success popup
    Swal.fire({
      title: 'Added to Cart!',
      text: `${item.type} (${item.qty}x) has been successfully added to your cart.`,
      icon: 'success',
      confirmButtonColor: '#0097b2',
      confirmButtonText: 'Okay',
      background: '#ffffff',
      color: '#333',
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    })

    showModal.value = false

  } catch (error) {
    console.error('Failed to add item to cart:', error)

    // ❌ Error popup
    Swal.fire({
      title: 'Error',
      text: 'Failed to add item to cart. Please try again.',
      icon: 'error',
      confirmButtonColor: '#e53e3e',
      background: '#fff',
      color: '#333'
    })
  }
}

// Direct order - creates immediate order with selected quantity
function handleOrderNow(item: ModalProduct) {
  console.log("🚀 Order Now with quantity:", item.qty);
  
  // Store the product with selected quantity for immediate ordering
  productForImmediateOrder.value = { ...item }
  
  showModal.value = false
  showSummaryModal.value = true
}

// Get products for OrderSummaryModal based on context
const productsForOrderSummary = computed((): ModalProduct[] => {
  if (productForImmediateOrder.value) {
    // For "Order Now" - use the single product with selected quantity
    console.log("📦 Immediate order product:", productForImmediateOrder.value);
    return [productForImmediateOrder.value]
  } else {
    // For cart checkout - use all cart items (future implementation)
    return cartStore.itemsForDisplay.map(item => ({
      id: item.gallon_id || 0,
      gallon_id: item.gallon_id,
      cart_item_id: item.cart_item_id,
      type: item.name || item.type || "Unknown Product",
      liters: item.liters || parseFloat(item.size) || 0,
      price: item.price || 0,
      qty: item.quantity || item.qty || 1,
      quantity: item.quantity || item.qty || 1,
      image_url: item.image_url,
      selected: item.selected,
      total_price: item.total_price || (item.price || 0) * (item.quantity || 1)
    }))
  }
})

// Handle order success
function handleOrderSuccess() {
  showSummaryModal.value = false
  productForImmediateOrder.value = null // Reset after successful order
  
  // Show success message for immediate order
  if (productForImmediateOrder.value) {
    Swal.fire({
      title: 'Order Placed!',
      text: `Your order for ${productForImmediateOrder.value} (${productForImmediateOrder.value}x) has been placed successfully.`,
      icon: 'success',
      confirmButtonColor: '#0097b2',
      background: '#fff',
      color: '#333'
    })
  }
}
</script>

<template>
  <div class="font-montserrat flex flex-col md:flex-row bg-gradient-to-b from-white to-secondary min-h-screen"> 
    <Sidebar class="hidden md:block" />

    <div class="flex-1 p-4 sm:p-6 md:p-10">
      <!-- Header -->
      <div class="flex flex-row items-center justify-between mb-8 gap-4">
        <h2 class="text-3xl sm:text-4xl font-semibold text-primary text-center sm:text-left">
          Gallon
        </h2>
        <img
          :src="Cart"
          @click="goToAddToCartPage"
          alt="Cart"
          class="w-9 h-9 sm:w-10 sm:h-10 cursor-pointer transition-transform"
        />
      </div>

    <!-- ✅ Container Cards -->
    <div class="flex justify-center items-center min-h-[80vh] px-6 sm:px-10">
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 xl:gap-14 place-items-center w-full max-w-7xl"
      >
        <div
          v-for="container in containers"
          :key="container.id"
          class="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center text-center w-full max-w-xs hover:shadow-lg transition"
        >
          <!-- ✅ Image from backend -->
          <img
            :src="`https://sismoya.bsit3b.site/api${container.image_url}`"
            :alt="container.type"
            class="w-32 h-32 sm:w-40 sm:h-40 object-contain mb-6"
          />

          <div class="text-sm sm:text-base space-y-1">
            <p class="font-semibold">Type: {{ container.type }}</p>
            <p>Liters: {{ container.liters }} liters</p>
            <p>Price: ₱{{ container.price.toFixed(2) }}</p>
          </div>

          <div class="flex flex-col sm:flex-row gap-4 mt-6 w-full">
            <button
              @click="openModal(container, 'cart')"
              class="flex-1 bg-primary text-white py-2 rounded-full hover:bg-secondary transition text-sm sm:text-base"
            >
              Add to Cart
            </button>

            <button
              @click="openModal(container, 'order')"
              class="flex-1 bg-primary text-white py-2 rounded-full hover:bg-secondary transition text-sm sm:text-base"
            >
              Order Now
            </button>
          </div>
        </div>
      </div>
    </div>

      
    </div>
  </div>

  <!-- Order Modal -->
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
    :products="productsForOrderSummary"
    @close="showSummaryModal = false"
    @place-order="handleOrderSuccess"
  />
</template>