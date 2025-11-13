<script setup lang="ts">
import { ref } from "vue";
import { changePassword } from "@/api/changePassApi";
import { EyeIcon, EyeSlashIcon } from "@heroicons/vue/24/outline";
import ConfirmModal from "@/components/ConfirmModal.vue"; // Adjust path as needed

const props = defineProps<{
  email: string;
  code: string; // reset verification code
}>();

const emit = defineEmits(["close", "success"]);

const password = ref("");
const confirm_password = ref("");
const error = ref("");
const isSubmitting = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const showSuccessModal = ref(false);

// validate and call API
async function handleSubmit() {
  if (!password.value || !confirm_password.value) {
    error.value = "Please fill out all fields.";
    return;
  }
  if (password.value !== confirm_password.value) {
    error.value = "Passwords do not match.";
    return;
  }

  isSubmitting.value = true;
  try {
    const res = await changePassword(props.email, password.value, confirm_password.value, props.code);
    console.log("Password changed successfully:", res);

    error.value = "";
    password.value = "";
    confirm_password.value = "";
    
    // Show success modal
    showSuccessModal.value = true;
  } catch (err: any) {
    console.error("Change password error:", err.response?.data || err.message);
    error.value = "Failed to change password. Please try again.";
  } finally {
    isSubmitting.value = false;
  }
}

function handleSuccessConfirm() {
  showSuccessModal.value = false;
  emit("success"); // let parent know it's done
  emit("close"); // close the change password modal
}
</script>

<template>
  <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div class="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md relative">
      <!-- Close X Button -->
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        aria-label="Close"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <h2 class="text-xl font-semibold text-center mb-6">Set New Password</h2>
      <p class="text-center text-sm text-gray-500 mb-5">
        Enter and confirm your new password.
      </p>

      <!-- Error Message -->
      <p v-if="error" class="text-red-500 text-sm text-center mb-4">{{ error }}</p>

      <!-- New Password -->
      <div class="mb-4 relative">
        <input
          :type="showPassword ? 'text' : 'password'"
          v-model="password"
          placeholder="New Password"
          class="w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="button"
          @click="showPassword = !showPassword"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
        >
          <EyeIcon v-if="!showPassword" class="h-5 w-5" />
          <EyeSlashIcon v-else class="h-5 w-5" />
        </button>
      </div>

      <!-- Confirm Password -->
      <div class="mb-6 relative">
        <input
          :type="showConfirmPassword ? 'text' : 'password'"
          v-model="confirm_password"
          placeholder="Confirm Password"
          class="w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="button"
          @click="showConfirmPassword = !showConfirmPassword"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
        >
          <EyeIcon v-if="!showConfirmPassword" class="h-5 w-5" />
          <EyeSlashIcon v-else class="h-5 w-5" />
        </button>
      </div>

      <!-- Submit Button -->
      <button
        class="w-1/2 mx-auto block px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-secondary transition"
        @click="handleSubmit"
        :disabled="isSubmitting"
      >
        {{ isSubmitting ? "Submitting..." : "Submit" }}
      </button>
    </div>

    <!-- Success Confirmation Modal -->
    <ConfirmModal
      :visible="showSuccessModal"
      type="success"
      title="Password Changed Successfully"
      message="Your password has been updated. You can now log in with your new password."
      confirmText="Go to Login"
      @confirm="handleSuccessConfirm"
      @close="handleSuccessConfirm"
    />
  </div>
</template>