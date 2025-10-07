<script setup lang="ts">
import { ref } from 'vue';

const oldPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

const showOldPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

const errorMessage = ref('');
const successMessage = ref('');

function changePassword() {
  errorMessage.value = '';
  successMessage.value = '';

  // Validation
  if (!oldPassword.value || !newPassword.value || !confirmPassword.value) {
    errorMessage.value = 'All fields are required';
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'New passwords do not match';
    return;
  }

  if (newPassword.value.length < 6) {
    errorMessage.value = 'Password must be at least 6 characters';
    return;
  }

  // Success
  successMessage.value = 'Password changed successfully!';
  oldPassword.value = '';
  newPassword.value = '';
  confirmPassword.value = '';
  
  setTimeout(() => {
    successMessage.value = '';
  }, 3000);
}
</script>

<template>
  <div class="pl-8">
    <h2 class="text-2xl font-bold mb-6">Change Password</h2>
    
    <div class="max-w-xl bg-white border border-gray-200 rounded-2xl p-8">
      <h3 class="text-xl font-semibold mb-6">Change Password</h3>
      
      <!-- Success Message -->
      <div v-if="successMessage" class="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
        {{ successMessage }}
      </div>
      
      <!-- Error Message -->
      <div v-if="errorMessage" class="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
        {{ errorMessage }}
      </div>

      <div class="space-y-5">
        <!-- Old Password -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Old Password</label>
          <div class="relative">
            <input
              v-model="oldPassword"
              :type="showOldPassword ? 'text' : 'password'"
              placeholder="············"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
            />
            <button
              @click="showOldPassword = !showOldPassword"
              type="button"
              class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <svg v-if="!showOldPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            </button>
          </div>
        </div>

        <!-- New Password -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">New Password</label>
          <div class="relative">
            <input
              v-model="newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              placeholder="············"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
            />
            <button
              @click="showNewPassword = !showNewPassword"
              type="button"
              class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <svg v-if="!showNewPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Confirm New Password -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
          <div class="relative">
            <input
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="············"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
            />
            <button
              @click="showConfirmPassword = !showConfirmPassword"
              type="button"
              class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <svg v-if="!showConfirmPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <button
        @click="changePassword"
        class="mt-6 w-1/2 block mx-auto bg-primary text-white py-3 rounded-xl font-medium hover:bg-secondary transition">
        Change Password
      </button>
    </div>
  </div>
</template>