<script setup lang="ts">
import { ref } from "vue";
import { changePassword } from "@/api/changePassApi";

const props = defineProps<{
  email: string;
  code: string; // reset verification code
}>();

const emit = defineEmits(["close", "success"]);

const password = ref("");
const confirm_password = ref("");
const error = ref("");
const isSubmitting = ref(false);

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

    emit("success"); // let parent know it's done
    error.value = "";
    password.value = "";
    confirm_password.value = "";
  } catch (err: any) {
    console.error("Change password error:", err.response?.data || err.message);
    error.value = "Failed to change password. Please try again.";
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div class="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md relative">
      <h2 class="text-xl font-semibold text-center mb-6">Set New Password</h2>
      <p class="text-center text-sm text-gray-500 mb-5">
        Enter and confirm your new password.
      </p>

      <!-- Error Message -->
      <p v-if="error" class="text-red-500 text-sm text-center mb-4">{{ error }}</p>

      <!-- New Password -->
      <div class="mb-4">
        <input
          type="password"
          v-model="password"
          placeholder="New Password"
          class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <!-- Confirm Password -->
      <div class="mb-6">
        <input
          type="password"
          v-model="confirm_password"
          placeholder="Confirm Password"
          class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <!-- Buttons -->
      <div class="flex justify-between">
        <button
          class="px-4 py-2 rounded-lg border hover:bg-gray-100 transition"
          @click="$emit('close')"
        >
          ← Back
        </button>
        <button
          class="px-4 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition"
          @click="handleSubmit"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? "Submitting..." : "Submit" }}
        </button>
      </div>
    </div>
  </div>
</template>
