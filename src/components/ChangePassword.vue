<script setup lang="ts">
import { ref } from "vue"
import Swal from "sweetalert2"
import { changePassword } from "@/utils/profileApi"

const oldPassword = ref("")
const newPassword = ref("")
const confirmPassword = ref("")
const loading = ref(false)

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
  <div class="max-w-md mx-auto mt-10 p-6">
    <h2 class="text-xl font-semibold mb-4">Change Password</h2>

    <form @submit.prevent="handleChangePassword">
      <div class="mb-4">
        <label class="block mb-1">Old Password</label>
        <input
          v-model="oldPassword"
          type="password"
          class="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-primary"
          placeholder="Enter your old password"
        />
      </div>

      <div class="mb-4">
        <label class="block mb-1">New Password</label>
        <input
          v-model="newPassword"
          type="password"
          class="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-primary"
          placeholder="Enter new password"
        />
      </div>

      <div class="mb-6">
        <label class="block mb-1">Confirm Password</label>
        <input
          v-model="confirmPassword"
          type="password"
          class="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
          placeholder="Confirm password"
        />
      </div>

      <button
        type="submit"
        :disabled="loading"
        class="w-1/2 block mx-auto rounded-full bg-primary text-white py-2 hover:bg-secondary disabled:opacity-50"
      >
        {{ loading ? "Updating..." : "Change Password" }}
      </button>
    </form>
  </div>
</template>
