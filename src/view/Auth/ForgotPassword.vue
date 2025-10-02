<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { requestPasswordReset} from "@/api/forgotPassApi";

import Navbar from "@components/LandingNavbar.vue";
import Footer from "@components/LandingFooter.vue";
import VerifyCode from "./VerifyCode.vue";
import ChangePass from "./ChangePass.vue";

import gallonImg from "@/assets/images/gallon.png";
import emailIcon from "@/assets/icons/email_icon.png";

const router = useRouter();
const showVerifyModal = ref(false);
const showChangePass = ref(false);
const email = ref("");
const verifiedCode = ref(""); 

function goToLogin() {
  router.push("/login");
}

const isSubmitting = ref(false); 

async function forgotPassword() {
  if (!email.value) {
    console.log("Please enter your email.");
    return;
  }

  if (isSubmitting.value) return; // prevent double click
  isSubmitting.value = true;

  try {
    const res = await requestPasswordReset(email.value);
    console.log("Reset email sent:", res);
    showVerifyModal.value = true;
  } catch (err: any) {
    console.error("Error:", err.response?.data || err.message);
    console.log("Failed to send reset email. Please try again.");
  } finally {
    isSubmitting.value = false; // re-enable after request finishes
  }
}


function handleCodeVerified(code: string) {
  console.log("Code verified:", code);
  verifiedCode.value = code;
  showVerifyModal.value = false;
  showChangePass.value = true;
}

</script>

<template>
  <Navbar />

  <section class="relative font-montserrat h-screen bg-gradient-to-b from-white to-secondary flex items-center justify-center">
    <div class="flex flex-col md:flex-row items-center justify-center w-full max-w-6xl px-6">
      <div class="flex-1 text-center md:text-left mt-[200px] mb-8 md:mb-0">
        <h1 class="text-3xl md:text-5xl font-semibold text-primary mb-6">
          WELCOME TO <br />
          SISMOYA WATER!
        </h1>
        <img :src="gallonImg" alt="Water Jugs" class="max-w-xl mx-auto md:mx-0 h-[500px]" />
      </div>

      <div class="flex-1 flex justify-center ml-[200px] pt-10">
        <div class="bg-white shadow-lg rounded-xl p-10 w-10/12 max-w-md">
          <h2 class="text-2xl font-semibold text-center mb-8">Forgot Password</h2>
          <div class="mb-4 relative">
            <input v-model="email" type="email" placeholder="Email" class="w-full pl-4 pr-4 py-2 bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"/>
          </div>

          <button 
            @click="forgotPassword"
            :disabled="isSubmitting"
            class="w-full mt-5 mb-4 py-2 rounded-lg font-medium transition
                  text-white bg-primary hover:bg-secondary
                  disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSubmitting ? "Sending..." : "Reset Password" }}
          </button>

          <p @click="goToLogin" class="text-center text-gray-500 mb-6 cursor-pointer hover:underline hover:text-black">
            ← Back to Login
          </p>
        </div>
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

  <Footer />
</template>
