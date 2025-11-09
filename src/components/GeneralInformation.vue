<script setup lang="ts">
import { ref } from "vue";

const showModal = ref(false);
const modalType = ref<"name" | "address" | "email" | "contact" | null>(null);

const formData = ref({
  business_name: "Sismoya Water",
  business_address: "34 Katarungan St. Brgy 149 Bagong Barrio Caloocan City",
  business_email: "sismoyawater@gmail.com",
  business_contact: "0925436834",
});

function openModal(type: "name" | "address" | "email" | "contact") {
  modalType.value = type;
  showModal.value = true;
}

function handleSave() {
  showModal.value = false;
}
</script>

<template>
  <div>
    <h2 class="text-xl sm:text-2xl font-bold mb-6">General Information</h2>

    <div class="space-y-4 sm:space-y-6 max-w-full sm:max-w-md">
      <!-- Business Name -->
      <div class="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
        <label class="w-full sm:w-36 text-gray-700 text-sm font-medium sm:pt-2">Business Name</label>
        <div class="flex-1 relative">
          <input
            type="text"
            :value="formData.business_name"
            disabled
            class="w-full px-4 py-2 text-sm border border-gray-600 rounded-full bg-gray-50 pr-10"
          />
          <button
            @click="openModal('name')"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500"
          >✎</button>
        </div>
      </div>

      <!-- Address -->
      <div class="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
        <label class="w-full sm:w-36 text-gray-700 text-sm font-medium sm:pt-2">Address</label>
        <div class="flex-1 relative">
          <input
            type="text"
            :value="formData.business_address"
            disabled
            class="w-full px-4 py-2 text-sm border border-gray-600 rounded-full bg-gray-50 pr-10"
          />
          <button
            @click="openModal('address')"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500"
          >✎</button>
        </div>
      </div>

      <!-- Email -->
      <div class="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
        <label class="w-full sm:w-36 text-gray-700 text-sm font-medium sm:pt-2">Email</label>
        <div class="flex-1 relative">
          <input
            type="email"
            :value="formData.business_email"
            disabled
            class="w-full px-4 py-2 text-sm border border-gray-600 rounded-full bg-gray-50 pr-10"
          />
          <button
            @click="openModal('email')"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500"
          >✎</button>
        </div>
      </div>

      <!-- Contact -->
      <div class="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
        <label class="w-full sm:w-36 text-gray-700 text-sm font-medium sm:pt-2">Contact</label>
        <div class="flex-1 relative">
          <input
            type="text"
            :value="formData.business_contact"
            disabled
            class="w-full px-4 py-2 text-sm border border-gray-600 rounded-full bg-gray-50 pr-10"
          />
          <button
            @click="openModal('contact')"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500"
          >✎</button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    >
      <div
        class="bg-white rounded-xl shadow-lg w-4/12 relative flex flex-col items-center justify-center p-8"
      >
        <button
          @click="showModal = false"
          class="absolute top-5 right-6 text-black text-xl font-semibold hover:text-gray-700"
        >
          ✕
        </button>

        <h2 class="text-lg font-semibold text-gray-900 mb-10 self-start">
          {{ modalType === 'name'
            ? 'Update Business Name'
            : modalType === 'address'
            ? 'Update Address'
            : modalType === 'email'
            ? 'Update Email'
            : 'Update Contact' }}
        </h2>

        <form @submit.prevent="handleSave" class="flex flex-col gap-8 w-full items-center">
          <template v-if="modalType === 'name'">
            <div class="flex items-center w-full">
              <label class="text-sm font-medium text-black text-right">Business Name:</label>
              <input
                v-model="formData.business_name"
                type="text"
                class="border border-black rounded-md px-3 py-2 ml-6 w-2/3 focus:outline-primary"
              />
            </div>
          </template>

          <template v-else-if="modalType === 'address'">
            <div class="flex items-center w-full">
              <label class="text-sm font-medium text-black text-right">Address:</label>
              <input
                v-model="formData.business_address"
                type="text"
                class="border border-black rounded-md px-3 py-2 ml-6 w-2/3 focus:outline-primary"
              />
            </div>
          </template>

          <template v-else-if="modalType === 'email'">
            <div class="flex items-center w-full">
              <label class="text-sm font-medium text-black text-right">Email:</label>
              <input
                v-model="formData.business_email"
                type="email"
                class="border border-black rounded-md px-3 py-2 ml-6 w-2/3 focus:outline-primary"
              />
            </div>
          </template>

          <template v-else-if="modalType === 'contact'">
            <div class="flex items-center w-full">
              <label class="text-sm font-medium text-black text-right">Contact:</label>
              <input
                v-model="formData.business_contact"
                type="text"
                class="border border-black rounded-md px-3 py-2 ml-6 w-2/3 focus:outline-primary"
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
  </div>
</template>
