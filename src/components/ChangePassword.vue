<script setup lang="ts">
import { ref } from "vue"
import { changePassword } from "@/utils/profileApi"
import ConfirmModal from "@/components/ConfirmModal.vue"

// Import Heroicons
import { EyeIcon, EyeSlashIcon } from "@heroicons/vue/24/outline"

const oldPassword = ref("")
const newPassword = ref("")
const confirmPassword = ref("")
const loading = ref(false)

// Visibility toggles - default to false (password hidden)
const showOld = ref(false)
const showNew = ref(false)
const showConfirm = ref(false)

// Result modal states
const showResultModal = ref(false)
const resultModalConfig = ref({
  title: '',
  message: '',
  type: 'success' as 'success' | 'error' | 'warning'
})

async function handleChangePassword() {
  loading.value = true
  try {
    await changePassword(
      oldPassword.value,
      newPassword.value,
      confirmPassword.value
    )

    resultModalConfig.value = {
      title: 'Password Changed Successfully',
      message: 'Your password has been updated.',
      type: 'success'
    }
    showResultModal.value = true

    oldPassword.value = ""
    newPassword.value = ""
    confirmPassword.value = ""
  } catch (error: any) {
    console.error("Full error:", error)

    if (error.response) {
      resultModalConfig.value = {
        title: 'Error Changing Password',
        message: error.response.data.message || 'Unknown error occurred.',
        type: 'error'
      }
      showResultModal.value = true
    } else if (error.request) {
      resultModalConfig.value = {
        title: 'No Response from Server',
        message: 'Please try again later.',
        type: 'warning'
      }
      showResultModal.value = true
    } else {
      resultModalConfig.value = {
        title: 'Unexpected Error',
        message: error.message || 'Something went wrong.',
        type: 'error'
      }
      showResultModal.value = true
    }
  } finally {
    loading.value = false
  }
}

function closeResultModal() {
  showResultModal.value = false
}
</script>

<template>
  <div class="px-4 sm:px-6 md:px-8">
    <div class="mb-6 sm:mb-8">
      <h2 class="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Change Password</h2>
      <p class="text-sm sm:text-base text-gray-600 max-w-2xl">
        Update your password to keep your account secure. Make sure your new password is strong and unique.
      </p>
    </div>

    <form
      @submit.prevent="handleChangePassword"
      class="space-y-4 sm:space-y-6 max-w-full sm:max-w-md"
    >
      <!-- Old Password -->
      <div class="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 relative">
        <label class="w-full sm:w-40 text-gray-700 text-sm font-medium sm:pt-2">
          Old Password
        </label>
        <div class="flex-1 relative">
          <input
            :type="showOld ? 'text' : 'password'"
            v-model="oldPassword"
            placeholder="Enter old password"
            class="w-full px-4 py-2 text-sm sm:text-base border border-gray-600 rounded-full bg-gray-50 pr-10 focus:ring focus:ring-primary focus:outline-none"
          />
          <button
            type="button"
            @click="showOld = !showOld"
            class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            <component :is="showOld ? EyeIcon : EyeSlashIcon" class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- New Password -->
      <div class="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 relative">
        <label class="w-full sm:w-40 text-gray-700 text-sm font-medium sm:pt-2">
          New Password
        </label>
        <div class="flex-1 relative">
          <input
            :type="showNew ? 'text' : 'password'"
            v-model="newPassword"
            placeholder="Enter new password"
            class="w-full px-4 py-2 text-sm sm:text-base border border-gray-600 rounded-full bg-gray-50 pr-10 focus:ring focus:ring-primary focus:outline-none"
          />
          <button
            type="button"
            @click="showNew = !showNew"
            class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            <component :is="showNew ? EyeIcon : EyeSlashIcon" class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Confirm Password -->
      <div class="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 relative">
        <label class="w-full sm:w-40 text-gray-700 text-sm font-medium sm:pt-2">
          Confirm Password
        </label>
        <div class="flex-1 relative">
          <input
            :type="showConfirm ? 'text' : 'password'"
            v-model="confirmPassword"
            placeholder="Confirm password"
            class="w-full px-4 py-2 text-sm sm:text-base border border-gray-600 rounded-full bg-gray-50 pr-10 focus:ring focus:ring-primary focus:outline-none"
          />
          <button
            type="button"
            @click="showConfirm = !showConfirm"
            class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            <component :is="showConfirm ? EyeIcon : EyeSlashIcon" class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Password Requirements -->
      <div class=" p-4">
        <p class="text-sm text-gray-700 font-medium mb-2">Password Requirements:</p>
        <ul class="text-xs sm:text-sm text-gray-600 space-y-1">
          <li class="flex items-start">
            <span class="mr-2">•</span>
            <span>At least 1 uppercase letter</span>
          </li>
          <li class="flex items-start">
            <span class="mr-2">•</span>
            <span>At least 1 special character (!@#$%^&*)</span>
          </li>
          <li class="flex items-start">
            <span class="mr-2">•</span>
            <span>At least 1 number</span>
          </li>
        </ul>
      </div>

      <!-- Submit Button -->
      <div class="pt-2">
        <button
          type="submit"
          :disabled="loading"
          class="w-40 sm:w-48 block mx-auto rounded-full bg-primary text-white py-2 hover:bg-secondary disabled:opacity-50 transition"
        >
          {{ loading ? "Updating..." : "Change Password" }}
        </button>
      </div>

    </form>

    <!-- Result Modal (Success/Error/Warning) -->
    <ConfirmModal
      :visible="showResultModal"
      :title="resultModalConfig.title"
      :message="resultModalConfig.message"
      :type="resultModalConfig.type"
      :show-cancel="false"
      confirm-text="OK"
      @confirm="closeResultModal"
      @close="closeResultModal"
    />
  </div>
</template>