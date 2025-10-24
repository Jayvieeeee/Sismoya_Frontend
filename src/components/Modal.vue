<!-- src/components/Modal.vue -->
<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
  >
    <div
      class="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 relative"
    >
      <button
        @click="$emit('close')"
        class="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-lg"
      >
        ✕
      </button>

      <h2 class="text-center text-cyan-600 text-lg font-semibold mb-5">
        {{ title }}
      </h2>

      <form @submit.prevent="$emit('save')">
        <slot />
        <div class="mt-6 flex justify-center">
          <button
            type="submit"
            class="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg transition"
          >
            Save
          </button>
        </div>
      </form>
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
