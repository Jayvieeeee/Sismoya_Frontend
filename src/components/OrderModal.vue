<script setup lang="ts">
import { ref, watch, computed } from "vue"
import type { ModalProduct } from "@/types"

const props = defineProps<{
  isOpen: boolean
  product: ModalProduct
  action: "cart" | "order"
}>()

const emit = defineEmits<{
  (e: "close"): void
  (e: "add-more", product: ModalProduct): void
  (e: "order-now", product: ModalProduct): void
}>()

// Local state for product inside modal
const localProduct = ref<ModalProduct>({ ...props.product })

// Computed property for image URL with proper formatting
const imageUrl = computed(() => {
  if (!localProduct.value.image_url) return ''
  
  let url = localProduct.value.image_url
  
  // Ensure the URL is properly formatted
  if (url.startsWith('/')) {
    // If it's a relative path, construct full URL
    url = `https://sismoya.bsit3b.site/api${url}`
  }
  
  // Add cache busting to avoid cached broken images
  return `${url}?t=${new Date().getTime()}`
})

// Image error handler
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  const fallbackElement = target.nextElementSibling as HTMLElement
  
  if (target && fallbackElement) {
    target.style.display = 'none'
    fallbackElement.style.display = 'block'
  }
}

// Sync props → local state whenever product changes
watch(
  () => props.product,
  (newProduct) => {
    localProduct.value = { ...newProduct }
  },
  { immediate: true, deep: true }
)

// Adjust quantity
function increaseQty() {
  localProduct.value.qty++
}
function decreaseQty() {
  if (localProduct.value.qty > 1) {
    localProduct.value.qty--
  }
}

// Computed total amount
const totalAmount = () =>
  (localProduct.value.qty * localProduct.value.price).toFixed(2)
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 font-montserrat">
    <div class="bg-white rounded-2xl p-6 shadow-lg max-w-xs w-full relative">
      <!-- Close button -->
      <button
        @click="emit('close')"
        class="absolute top-4 right-4 text-black hover:text-gray-700 text-xl"
      >
        ✕
      </button>

      <!-- Product Image with error handling -->
      <div class="w-36 h-36 mx-auto mb-4 flex items-center justify-center">
        <img
          :src="imageUrl"
          :alt="localProduct.type"
          class="w-full h-full object-contain"
          @error="handleImageError"
        />
        <div class="hidden text-gray-400 text-sm text-center">
          No image<br/>available
        </div>
      </div>

      <!-- Product Info (left aligned) -->
      <div class="text-left space-y-1 mb-4">
        <p class="font-semibold">Type: {{ localProduct.type }}</p>
        <p>Liters: {{ localProduct.liters }} liters</p>
        <p>Price: ₱{{ localProduct.price.toFixed(2) }}</p>
      </div>

      <!-- Quantity Selector -->
      <div class="flex items-center gap-3 mb-4">
        <span class="font-medium">Quantity:</span>
        <div class="flex items-center gap-3">
          <button
            @click="decreaseQty"
            class="w-6 h-6 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300"
          >
            -
          </button>
          <span class="text-sm font-medium w-8 text-center">{{ localProduct.qty }}</span>
          <button
            @click="increaseQty"
            class="w-6 h-6 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300"
          >
            +
          </button>
        </div>
      </div>

      <!-- Total -->
      <p class="text-left text-sm font-semibold mb-6">
        Total Amount: ₱{{ totalAmount() }}
      </p>

      <!-- Action Button -->
      <div class="flex justify-center">
        <button
          v-if="props.action === 'cart'"
          @click="emit('add-more', localProduct)"
          class="px-6 py-3 text-xs rounded-full bg-primary text-white hover:bg-secondary transition-colors"
        >
          Add to Cart
        </button>

        <button
          v-else-if="props.action === 'order'"
          @click="emit('order-now', localProduct)"
          class="px-6 py-3 text-xs rounded-full bg-primary text-white hover:bg-secondary transition-colors"
        >
          Order Now
        </button>
      </div>

    </div>
  </div>
</template>