<template>
  <transition name="fade">
    <div
      v-if="visible"
      class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
    >
      <div
        class="bg-white rounded-2xl shadow-lg w-80 sm:w-96 p-6 text-center space-y-5"
      >
        <!-- ✅ Success Icon -->
        <div class="flex justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-12 h-12 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <!-- ✅ Title -->
        <h2 class="text-xl font-semibold text-gray-800">{{ title }}</h2>

        <!-- ✅ Message -->
        <p class="text-gray-600">{{ message }}</p>

        <!-- ✅ OK Button -->
        <button
          @click="$emit('ok')"
          class="bg-primary text-white px-6 py-2 rounded-full hover:bg-secondary transition mt-4"
        >
          OK
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
const props = defineProps({
  visible: { type: Boolean, required: true },
  title: { type: String, default: "Success!" },
  message: { type: String, required: true },
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
