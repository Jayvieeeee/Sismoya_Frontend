<template>
  <div class="p-6">
    <!-- Profile Info Section -->
    <div class="bg-white shadow-md rounded-lg p-6 w-full max-w-lg mx-auto">
      <h2 class="text-2xl font-semibold mb-4 text-gray-800">Personal Information</h2>

      <div class="space-y-3 mb-6">
        <p>
          <span class="font-medium text-gray-700">First Name:</span>
          {{ user?.first_name }}
        </p>
        <p>
          <span class="font-medium text-gray-700">Last Name:</span>
          {{ user?.last_name }}
        </p>
      </div>

      <button
        @click="showModal = true"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Edit Name
      </button>
    </div>

    <!-- Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
        <button
          @click="showModal = false"
          class="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
        >
          ×
        </button>

        <h2 class="text-xl font-semibold mb-4 text-gray-800">Update Name</h2>

        <form @submit.prevent="handleSave" class="space-y-4">
          <div>
            <label class="block text-gray-700 text-sm font-medium mb-1">First Name</label>
            <input
              v-model="formData.first_name"
              type="text"
              class="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label class="block text-gray-700 text-sm font-medium mb-1">Last Name</label>
            <input
              v-model="formData.last_name"
              type="text"
              class="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <button
            type="submit"
            class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            :disabled="loading"
          >
            {{ loading ? "Saving..." : "Save Changes" }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { getProfile, updateProfile } from "@/api/profileApi"
import Swal from "sweetalert2"

const showModal = ref(false)
const loading = ref(false)
const user = ref<any>(null)

const formData = ref({
  first_name: "",
  last_name: ""
})

// 🔹 Load current profile
async function loadProfile() {
  try {
    const data = await getProfile()
    user.value = data
    formData.value.first_name = data.first_name
    formData.value.last_name = data.last_name
  } catch (err) {
    console.error("Failed to load profile:", err)
  }
}

// 🔹 Save updated name
async function handleSave() {
  loading.value = true
  try {
    await updateProfile({
      first_name: formData.value.first_name,
      last_name: formData.value.last_name
    })

    await Swal.fire({
      icon: "success",
      title: "Profile Updated",
      text: "Your name has been updated successfully!",
      confirmButtonColor: "#3B82F6"
    })

    showModal.value = false
    await loadProfile()
  } catch (err: any) {
    Swal.fire({
      icon: "error",
      title: "Update Failed",
      text: err.response?.data?.message || "Something went wrong.",
      confirmButtonColor: "#EF4444"
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProfile()
})
</script>
