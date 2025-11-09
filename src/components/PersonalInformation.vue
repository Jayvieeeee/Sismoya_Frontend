<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getProfile, updateProfile } from '@/utils/profileApi'
import ConfirmModal from '@/components/ConfirmModal.vue'

// ✅ Import Heroicons
import { PencilSquareIcon } from '@heroicons/vue/24/outline'

const user = ref<any>(null)
const loading = ref(true)
const showModal = ref(false)
const modalType = ref<'name' | 'email' | 'contact' | null>(null)
const formData = ref({
  first_name: '',
  last_name: '',
  email: '',
  contact_no: ''
})

// Result modal states
const showResultModal = ref(false)
const resultModalConfig = ref({
  title: '',
  message: '',
  type: 'success' as 'success' | 'error'
})

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

function openModal(type: 'name' | 'email' | 'contact') {
  modalType.value = type
  showModal.value = true
}

async function handleSave() {
  loading.value = true
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

    await updateProfile(updateData)
    
    showModal.value = false
    
    resultModalConfig.value = {
      title: 'Profile Updated',
      message: 'Your profile has been updated successfully!',
      type: 'success'
    }
    showResultModal.value = true

    const refreshed = await getProfile()
    user.value = refreshed
  } catch (err: any) {
    showModal.value = false
    
    resultModalConfig.value = {
      title: 'Update Failed',
      message: err.response?.data?.message || 'Something went wrong.',
      type: 'error'
    }
    showResultModal.value = true
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
            class="w-full px-4 py-2 text-sm sm:text-base border border-gray-600 rounded-full bg-gray-50 pr-10"
          />
          <button
            @click="openModal('name')"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500"
          >
            <PencilSquareIcon class="w-5 h-5" />
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
            class="w-full px-4 py-2 text-sm sm:text-base border border-gray-600 rounded-full bg-gray-50 pr-10"
          />
          <button
            @click="openModal('email')"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500"
          >
            <PencilSquareIcon class="w-5 h-5" />
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
            class="w-full px-4 py-2 text-sm sm:text-base border border-gray-600 rounded-full bg-gray-50 pr-10"
          />
          <button
            @click="openModal('contact')"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500"
          >
            <PencilSquareIcon class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    >
      <div
        class="bg-white rounded-xl shadow-lg w-4/12 relative flex flex-col items-center justify-center p-8"
      >
        <!-- Close Button -->
        <button
          @click="showModal = false"
          class="absolute top-5 right-6 text-black text-xl font-semibold hover:text-gray-700"
        >
          ✕
        </button>

        <!-- Title -->
        <h2 class="text-lg font-semibold text-gray-900 mb-10 self-start">
          {{ modalType === 'name'
            ? 'Update Name'
            : modalType === 'email'
            ? 'Update Email'
            : 'Update Contact' }}
        </h2>

        <!-- Form -->
        <form
          @submit.prevent="handleSave"
          class="flex flex-col gap-8 w-full items-center"
        >
          <template v-if="modalType === 'name'">
            <div class="flex items-center w-full">
              <label class="text-sm font-medium text-black text-right">
                First Name:
              </label>
              <input
                v-model="formData.first_name"
                type="text"
                class="border border-black rounded-md px-3 py-2 ml-6 w-2/3 focus:outline-primary"
              />
            </div>

            <div class="flex items-center w-full">
              <label class="text-sm font-medium text-black text-right">
                Last Name:
              </label>
              <input
                v-model="formData.last_name"
                type="text"
                class="border border-black rounded-md px-3 py-2 ml-6 w-2/3 focus:outline-primary"
              />
            </div>
          </template>

          <template v-else-if="modalType === 'email'">
            <div class="flex items-center w-full">
              <label class="text-sm font-medium text-black text-right">
                Email:
              </label>
              <input
                v-model="formData.email"
                type="email"
                class="border border-black rounded-md px-3 py-2 ml-6 w-2/3 focus:outline-primary"
              />
            </div>
          </template>

          <template v-else-if="modalType === 'contact'">
            <div class="flex items-center w-full">
              <label class="text-sm font-medium text-black text-right">
                Contact No.:
              </label>
              <input
                v-model="formData.contact_no"
                type="tel"
                class="border border-black rounded-md px-3 py-2 ml-6 w-2/3 focus:outline-none"
              />
            </div>
          </template>

          <button
            type="submit"
            class="bg-[#2D8CBA] text-white text-sm px-8 py-2 rounded-md hover:bg-[#24759b] transition mt-10"
          >
            Save
          </button>
        </form>
      </div>
    </div>

    <!-- Result Modal (Success/Error) -->
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