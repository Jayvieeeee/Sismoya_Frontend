<script setup lang="ts">
import { ref, watch } from "vue"
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

// Sync props → local state whenever product changes
watch(
  () => props.product,
  (newProduct) => {
    localProduct.value = { ...newProduct }
  },
  { immediate: true }
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

      <!-- Product Image -->
      <img
        :src="localProduct.image_url"
        alt="Product"
        class="w-36 h-36 object-contain mx-auto mb-4"
      />

      <!-- Product Info (left aligned) -->
      <div class="text-left space-y-1 mb-4">
        <p>Type: {{ localProduct.type }}</p>
        <p>Liters: {{ localProduct.liters }} liters</p>
        <p>Price: {{ localProduct.price.toFixed(2) }}</p>
      </div>

      <!-- Quantity Selector -->
      <div class="flex items-center gap-3 mb-4">
        <span>Quantity:</span>
        <div class="flex items-center gap-3">
          <button
            @click="decreaseQty"
            class="w-4 h-4 text-xl flex items-center justify-center "
          >
            -
          </button>
          <span class="text-sm font-medium">{{ localProduct.qty }}</span>
          <button
            @click="increaseQty"
            class="w-4 h-4 text-xl flex items-center justify-center"
          >
            +
          </button>
        </div>
      </div>

      <!-- Total -->
      <p class="text-left text-sm font-semibold mb-6">
        Total Amount: {{ totalAmount() }}
      </p>

     <!-- Action Button -->
    <div class="flex justify-center">
      <button
        v-if="props.action === 'cart'"
        @click="emit('add-more', localProduct)"
        class="px-6 py-3 text-xs rounded-full bg-primary text-white hover:bg-secondary"
      >
        Add to Cart
      </button>

      <button
        v-else-if="props.action === 'order'"
        @click="emit('order-now', localProduct)"
        class="px-6 py-3 text-xs rounded-full bg-primary text-white hover:bg-secondary"
      >
        Order Now
      </button>
    </div>

    </div>
  </div>
</template>

