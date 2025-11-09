<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
  >
    <div
      class="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 relative"
    >
      <!-- Close Button -->
      <button
        @click="$emit('close')"
        class="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-lg"
      >
        ✕
      </button>

      <!-- Icon -->
      <div class="flex justify-center mb-4">
        <div
          v-if="type === 'warning'"
          class="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center"
        >
          <svg class="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
        </div>
        <div
          v-else-if="type === 'success'"
          class="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center"
        >
          <svg class="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <div
          v-else-if="type === 'error'"
          class="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center"
        >
          <svg class="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </div>
      </div>

      <!-- Title -->
      <h2 class="text-center text-gray-800 text-xl font-semibold mb-3">
        {{ title }}
      </h2>

      <!-- Message -->
      <p class="text-center text-gray-600 mb-6">
        {{ message }}
      </p>

      <!-- Actions -->
      <div class="flex justify-center gap-3">
        <button
          v-if="showCancel"
          @click="$emit('cancel')"
          class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          {{ cancelText }}
        </button>
        <button
          @click="$emit('confirm')"
          :class="confirmButtonClass"
          class="px-6 py-2 text-white rounded-lg transition-colors"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  visible: boolean
  title: string
  message: string
  type?: 'warning' | 'success' | 'error'
  showCancel?: boolean
  confirmText?: string
  cancelText?: string
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const confirmButtonClass = computed(() => {
  if (props.type === 'warning' || props.type === 'error') {
    return 'bg-primary hover:bg-secondary';
  }
  return 'bg-primary hover:bg-secondary';
});
</script>