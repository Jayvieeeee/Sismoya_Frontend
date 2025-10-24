<script setup lang="ts">
import { ref } from "vue"
import Swal from "sweetalert2"
import { changePassword } from "@/utils/profileApi"

// Import Heroicons
import { EyeIcon, EyeSlashIcon } from "@heroicons/vue/24/outline"

const oldPassword = ref("")
const newPassword = ref("")
const confirmPassword = ref("")
const loading = ref(false)

// Visibility toggles
const showOld = ref(false)
const showNew = ref(false)
const showConfirm = ref(false)

async function handleChangePassword() {
  loading.value = true
  try {
    await changePassword(
      oldPassword.value,
      newPassword.value,
      confirmPassword.value
    )

    Swal.fire({
      icon: "success",
      title: "Password Changed Successfully",
      text: "Your password has been updated.",
      confirmButtonColor: "#2563eb",
    })

    oldPassword.value = ""
    newPassword.value = ""
    confirmPassword.value = ""
  } catch (error: any) {
    console.error("Full error:", error)

    if (error.response) {
      Swal.fire({
        icon: "error",
        title: "Error Changing Password",
        text: error.response.data.message || "Unknown error occurred.",
        confirmButtonColor: "#ef4444",
      })
    } else if (error.request) {
      Swal.fire({
        icon: "warning",
        title: "No Response from Server",
        text: "Please try again later.",
      })
    } else {
      Swal.fire({
        icon: "error",
        title: "Unexpected Error",
        text: error.message || "Something went wrong.",
      })
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="px-4 sm:px-6 md:px-8">
    <h2 class="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">Change Password</h2>

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
            <component :is="showOld ? EyeSlashIcon : EyeIcon" class="w-5 h-5" />
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
            <component :is="showNew ? EyeSlashIcon : EyeIcon" class="w-5 h-5" />
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
            <component :is="showConfirm ? EyeSlashIcon : EyeIcon" class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="pt-24">
        <button
          type="submit"
          :disabled="loading"
          class="w-40 sm:w-48 block mx-auto rounded-full bg-primary text-white py-2 hover:bg-secondary disabled:opacity-50 transition"
        >
          {{ loading ? "Updating..." : "Change Password" }}
        </button>
      </div>
    </form>
  </div>
</template>
