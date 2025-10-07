<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { requestPasswordReset} from "@/api/forgotPassApi";
import LandingPageLayout from '@/Layout/LandingPageLayout.vue'

import VerifyCode from "./VerifyCode.vue";
import ChangePass from "./ChangePass.vue";

import gallonImg from "@/assets/images/gallon.png";


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
    <section class="relative font-montserrat min-h-screen bg-gradient-to-b from-white to-secondary flex flex-col md:flex-row items-center justify-center px-6 py-12 gap-10">
      <!-- Left side: Text + Image -->
      <div
        class="flex-1 ml-24 mt-12 text-center md:text-left flex flex-col items-center md:items-start">
        <h1 class="text-2xl md:text-4xl font-semibold text-primary mb-6">
          WELCOME TO <br />
          SISMOYA WATER!
        </h1>
        <img
          :src="gallonImg"
          alt="Water Jugs"
          class="w-full max-w-xs sm:max-w-sm lg:max-w-md"
        />
      </div>

      <!-- Right side: Forgot Password Form -->
      <div class="flex-1 flex justify-center w-full">
        <div class="bg-white shadow-lg rounded-xl p-8 sm:p-10 w-3/5 max-w-sm md:max-w-md">
          <h2 class="text-2xl font-semibold text-center mb-8">
            Forgot Password
          </h2>

          <div class="mb-4">
            <div class="relative">
              <input
                v-model="email"
                @input="clearError"
                type="email"
                placeholder="Email"
                class="w-full pl-4 pr-4 py-3 bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                :class="{ 'border-red-500': emailError }"
              />
            </div>
            <!-- Error message -->
            <p v-if="emailError" class="text-red-500 text-sm mt-2 ml-1">
              {{ emailError }}
            </p>
          </div>

          <button
            @click="forgotPassword"
            :disabled="isSubmitting"
            class="w-full mt-5 mb-4 py-3 rounded-lg font-medium transition text-white bg-primary hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSubmitting ? "Sending..." : "Reset Password" }}
          </button>

          <p
            @click="goToLogin"
            class="text-center text-gray-500 mb-6 cursor-pointer hover:underline hover:text-black"
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

