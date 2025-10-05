<template>
  <transition name="fade">
    <div
      v-if="visible"
      class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
    >
      <div
        class="bg-white rounded-2xl shadow-lg w-80 sm:w-96 p-6 text-center space-y-5"
      >
        <h2 class="text-lg font-semibold text-gray-800">{{ title }}</h2>
        <p class="text-gray-600">{{ message }}</p>

        <div class="flex justify-center gap-4 mt-6">
          <button
            @click="confirm"
            class="bg-primary text-white px-4 py-2 rounded-full hover:bg-secondary transition"
          >
            Yes
          </button>
          <button
            @click="cancel"
            class="bg-gray-200 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-300 transition"
          >
            No
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref } from "vue"

const props = defineProps({
  title: { type: String, default: "Confirm Action" },
  message: { type: String, required: true },
  visible: { type: Boolean, required: true },
})

const emits = defineEmits(["confirm", "cancel"])
const confirm = () => emits("confirm")
const cancel = () => emits("cancel")
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
