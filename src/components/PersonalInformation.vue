<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getProfile, updateProfile } from '@/api/profileApi'
import Swal from 'sweetalert2'

// 🧩 Data
const user = ref<any>(null)
const loading = ref(true)

// 🧩 Modal state
const showModal = ref(false)
const modalType = ref<'name' | 'email' | 'contact' | null>(null)
const formData = ref({
  first_name: '',
  last_name: '',
  email: '',
  contact_no: ''
})

// 🧩 Fetch profile when mounted
onMounted(async () => {
  try {
    const profile = await getProfile()
    user.value = profile
    formData.value = {
      first_name: profile.first_name,
      last_name: profile.last_name,
      email: profile.email,
      contact_no: profile.contact_no
    }
  } catch (err) {
    console.error('Failed to load profile:', err)
  } finally {
    loading.value = false
  }
})

// 🧩 Open modal based on which icon clicked
function openModal(type: 'name' | 'email' | 'contact') {
  modalType.value = type
  showModal.value = true
}

async function handleSave() {
  try {
    let updateData = {}

    if (modalType.value === 'name') {
      updateData = {
        first_name: formData.value.first_name,
        last_name: formData.value.last_name
      }
    } else if (modalType.value === 'email') {
      updateData = { email: formData.value.email }
    } else if (modalType.value === 'contact') {
      updateData = { contact_no: formData.value.contact_no }
    }

    const res = await updateProfile(updateData)

    await Swal.fire({
      icon: 'success',
      title: 'Profile Updated',
      text: res.message || 'Your profile has been updated successfully!',
      confirmButtonColor: '#3B82F6'
    })

    showModal.value = false
    const refreshed = await getProfile()
    user.value = refreshed
  } catch (err: any) {
    Swal.fire({
      icon: 'error',
      title: 'Update Failed',
      text: err.response?.data?.message || 'Something went wrong.',
      confirmButtonColor: '#EF4444'
    })
  }
}


</script>

<template>
  <div class="px-4 sm:px-6 md:px-8">
    <h2 class="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">Personal Information</h2>

    <div v-if="!loading && user" class="space-y-4 sm:space-y-6 max-w-full sm:max-w-md">
      <!-- Name -->
      <div class="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
        <label class="w-full sm:w-28 text-gray-700 text-sm font-medium sm:pt-2">Name</label>
        <div class="flex-1 relative">
          <input
            type="text"
            :value="user.first_name + ' ' + user.last_name"
            disabled
            class="w-full px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-full bg-gray-50 pr-10"
          />
          <button
            @click="openModal('name')"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500"
          >
            ✎
          </button>
        </div>
      </div>

      <!-- Email -->
      <div class="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
        <label class="w-full sm:w-28 text-gray-700 text-sm font-medium sm:pt-2">Email</label>
        <div class="flex-1 relative">
          <input
            type="email"
            :value="user.email"
            disabled
            class="w-full px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-full bg-gray-50 pr-10"
          />
          <button
            @click="openModal('email')"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500"
          >
            ✎
          </button>
        </div>
      </div>

      <!-- Contact -->
      <div class="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
        <label class="w-full sm:w-28 text-gray-700 text-sm font-medium sm:pt-2">Contact No.</label>
        <div class="flex-1 relative">
          <input
            type="tel"
            :value="user.contact_no"
            disabled
            class="w-full px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-full bg-gray-50 pr-10"
          />
          <button
            @click="openModal('contact')"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500"
          >
            ✎
          </button>
        </div>
      </div>
    </div>

    <!-- ✅ Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-xl p-6 w-full max-w-sm relative shadow-lg">
        <button
          @click="showModal = false"
          class="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        <h2 class="text-lg font-semibold mb-4">
          {{ modalType === 'name' ? 'Update Name' : modalType === 'email' ? 'Update Email' : 'Update Contact' }}
        </h2>

        <form @submit.prevent="handleSave">
          <div v-if="modalType === 'name'" class="space-y-3">
            <input
              v-model="formData.first_name"
              type="text"
              placeholder="First Name"
              class="w-full border rounded-lg px-3 py-2"
            />
            <input
              v-model="formData.last_name"
              type="text"
              placeholder="Last Name"
              class="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div v-else-if="modalType === 'email'">
            <input
              v-model="formData.email"
              type="email"
              placeholder="Email"
              class="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div v-else-if="modalType === 'contact'">
            <input
              v-model="formData.contact_no"
              type="tel"
              placeholder="Contact Number"
              class="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <button
            type="submit"
            class="w-full bg-blue-500 text-white py-2 mt-5 rounded-lg hover:bg-blue-600"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
