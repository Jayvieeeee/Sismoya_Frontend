<script setup lang="ts">
defineProps<{
  isOpen: boolean
}>()

defineEmits<{
  (e: "close"): void
}>()

// ✅ Import the icon so Vite can resolve it
import checkIcon from "@/assets/icons/checkIcon.png"
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 font-montserrat"
  >
    <div class="bg-white rounded-xl shadow-lg p-6 w-80 relative text-center">
      <!-- Close Button -->
      <button
        @click="$emit('close')"
        class="absolute top-2 right-3 text-black text-xl font-bold"
      >
        ✕
      </button>

      <!-- Title -->
      <h2 class="text-blue-500 font-semibold text-lg mb-4">Order Placed</h2>

      <!-- ✅ Icon (bound via :src) -->
      <img
        :src="checkIcon"
        alt="Success"
        class="mx-auto mb-4 w-25 h-25"
      />

      <!-- Message -->
      <p class="text-sm text-gray-700">
        Go to your order history to track your orders.
      </p>
    </div>
  </div>
</template>
