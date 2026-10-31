<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { requestPasswordReset} from "@/api/forgotPassApi";
import LandingPageLayout from '@/Layout/LandingPageLayout.vue'

import VerifyCode from "./VerifyCode.vue";
import ChangePass from "./ChangePass.vue";

const router = useRouter();
const showVerifyModal = ref(false);
const showChangePass = ref(false);
const email = ref("");
const verifiedCode = ref(""); 
const emailError = ref("");

function goToLogin() {
  router.push("/login");
}

const isSubmitting = ref(false); 

function validateEmail() {
  if (!email.value.trim()) {
    emailError.value = "Please enter your email.";
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value)) {
    emailError.value = "Please enter a valid email address.";
    return false;
  }
  
  emailError.value = "";
  return true;
}

async function forgotPassword() {
  if (!validateEmail()) {
    return;
  }

  if (isSubmitting.value) return;
  isSubmitting.value = true;

  try {
    const res = await requestPasswordReset(email.value);
    console.log("Reset email sent:", res);
    showVerifyModal.value = true;
    emailError.value = ""; // Clear any previous errors
  } catch (err: any) {
    // Handle different error responses from backend
    if (err.response?.status === 404) {
      emailError.value = "Email not found. Please check your email address.";
    } else if (err.response?.status === 422) {
      emailError.value = "Please enter a valid email address.";
    } else {
      console.error("Error:", err.response?.data || err.message);
      emailError.value = "An error occurred. Please try again.";
    }
  } finally {
    isSubmitting.value = false;
  }
}

function handleCodeVerified(code: string) {
  console.log("Code verified:", code);
  verifiedCode.value = code;
  showVerifyModal.value = false;
  showChangePass.value = true;
}

function clearError() {
  if (emailError.value) {
    emailError.value = "";
  }
}
</script>

<template>
  <LandingPageLayout>
    <section class="min-h-screen bg-white flex items-center justify-center px-6 py-12">
      <div class="w-full max-w-md text-center">
        <h1 class="text-3xl font-semibold text-gray-900 mb-2">
          Forgot Password
        </h1>
        <p class="text-sm text-gray-500 mb-8">
          Please provide your email address to reset your account password.
        </p>

        <div class="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-left">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            v-model="email"
            @input="clearError"
            type="email"
            placeholder="Enter your email"
            class="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            :class="{ 'border-red-500': emailError }"
          />
          <p v-if="emailError" class="text-red-500 text-sm mt-2">
            {{ emailError }}
          </p>

          <button
            @click="forgotPassword"
            :disabled="isSubmitting"
            class="w-full mt-5 py-2.5 rounded-full font-medium transition text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSubmitting ? "Sending..." : "Send Code" }}
          </button>

          <p
            @click="goToLogin"
            class="text-center text-gray-500 text-sm mt-6 cursor-pointer hover:underline hover:text-gray-700"
          >
            Back to Login
          </p>
        </div>
      </div>

      <!-- Step 2: Verify Code -->
      <VerifyCode
        v-if="showVerifyModal"
        :email="email"
        @close="showVerifyModal = false"
        @verified="handleCodeVerified"
      />

      <!-- Step 3: Change Password -->
      <ChangePass
        v-if="showChangePass"
        :email="email"
        :code="verifiedCode"
        @close="showChangePass = false"
        @success="goToLogin"
      />
    </section>
  </LandingPageLayout>
</template>