<script setup lang="ts">
import { ref } from 'vue';

const name = ref('Chrisha Dalmacio');
const email = ref('chrishadalmacio@gmail.com');
const contactNo = ref('09123456789');
const isEditingName = ref(false);
const isEditingEmail = ref(false);
const isEditingContact = ref(false);
</script>

<template>
  <div class="px-4 sm:px-6 md:px-8">
    <h2 class="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">Personal Information</h2>

    <div class="space-y-4 sm:space-y-6 max-w-full sm:max-w-md">
      <!-- Name Field -->
      <div class="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
        <label class="w-full sm:w-28 text-gray-700 text-sm font-medium sm:font-normal sm:pt-2">Name</label>
        <div class="flex-1 relative">
          <input
            v-model="name"
            type="text"
            :disabled="!isEditingName"
            class="w-full px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-400 focus:outline-none disabled:bg-gray-50 pr-10"
          />
          <button
            @click="isEditingName = !isEditingName"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Email Field -->
      <div class="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
        <label class="w-full sm:w-28 text-gray-700 text-sm font-medium sm:font-normal sm:pt-2">Email</label>
        <div class="flex-1 relative">
          <input
            v-model="email"
            type="email"
            :disabled="!isEditingEmail"
            class="w-full px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-400 focus:outline-none disabled:bg-gray-50 pr-10"
          />
          <button
            @click="isEditingEmail = !isEditingEmail"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Contact Number Field -->
      <div class="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
        <label class="w-full sm:w-28 text-gray-700 text-sm font-medium sm:font-normal sm:pt-2">Contact No.</label>
        <div class="flex-1 relative">
          <input
            v-model="contactNo"
            type="tel"
            :disabled="!isEditingContact"
            class="w-full px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-400 focus:outline-none disabled:bg-gray-50 pr-10"
          />
          <button
            @click="isEditingContact = !isEditingContact"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>