<template>
  <div
    v-if="visible"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
  >
    <div
      class="bg-white rounded-xl shadow-xl w-80 p-6 text-center animate-fade-in"
    >
      <h2 class="text-xl font-semibold text-red-600 mb-3">
        {{ title }}
      </h2>
      <p class="text-gray-700 mb-6">{{ message }}</p>

      <button
        @click="$emit('close')"
        class="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-6 rounded-lg transition"
      >
        OK
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  visible: Boolean,
  title: String,
  message: String
})

defineEmits(["close"])
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in {
  animation: fade-in 0.25s ease-out;
}
</style>
