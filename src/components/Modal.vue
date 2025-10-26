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

      <!-- Title -->
      <h2 class="text-center text-cyan-600 text-lg font-semibold mb-5">
        {{ title }}
      </h2>

      <!-- Main Content -->
      <div class="text-center mb-6">
        <slot />
      </div>

      <!-- ✅ Bottom Actions (no default Save button) -->
      <div class="flex justify-center gap-4">
        <slot name="actions"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean
  title: string
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'save'): void
}>()
</script>
