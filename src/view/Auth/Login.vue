<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

import Navbar from "@components/LandingNavbar.vue";
import Footer from "@components/LandingFooter.vue";

import gallonImg from "@/assets/images/gallon.png";
import emailIcon from "@/assets/icons/email_icon.png";
import lockIcon from "@/assets/icons/lock_icon.png";

import { loginUser } from "@/api/loginApi";

const router = useRouter();

// form data
const identifier = ref("");
const password = ref("");
const showPassword = ref(false);

// feedback
const errorMessage = ref("");

async function handleLogin() {
  errorMessage.value = "";

  if (!identifier.value || !password.value) {
    errorMessage.value = "Please fill in all fields.";
    return;
  }

  try {
    const user = await loginUser(identifier.value, password.value);
    localStorage.setItem("user", JSON.stringify(user));
    router.push("/customerDashboard");
  } catch (err: any) {
    errorMessage.value = "Login failed. Please check your credentials.";
  }
}

function goToRegister() {
  router.push("/register");
}

function goToForgotPass() {
  router.push("/forgotpass");
}
</script>

<template>
  <Navbar />

  <section
    class="relative font-montserrat min-h-screen bg-gradient-to-b from-white to-secondary flex items-center justify-center px-4 py-12"
  >
    <div
      class="flex flex-col md:flex-row items-center justify-center w-full max-w-6xl gap-12 mt-12"
    >
      <!-- Left side: Text + Image -->
      <div class="flex-1 text-center md:text-left">
        <h1 class="text-3xl md:text-5xl font-semibold text-primary mb-6">
          WELCOME TO <br />
          SISMOYA WATER!
        </h1>
        <img
          :src="gallonImg"
          alt="Water Jugs"
          class="w-full max-w-sm md:max-w-md lg:max-w-lg mx-auto md:mx-0"
        />
      </div>

      <!-- Right side: Login Form -->
      <div class="flex-1 flex justify-center">
        <div class="bg-white shadow-lg rounded-xl p-8 sm:p-10 w-full max-w-sm">
          <h2 class="text-2xl font-semibold text-center mb-6">Login</h2>

          <!-- identifier -->
          <div class="mb-4 relative">
            <img
              :src="emailIcon"
              alt="EMAIL"
              class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
            />
            <input
              v-model="identifier"
              type="text"
              placeholder="Email or Username"
              class="w-full pl-12 pr-4 py-2 bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <p
              v-if="!identifier && errorMessage"
              class="text-red-500 text-xs mt-1"
            >
              Please enter your email or username.
            </p>
          </div>

          <!-- password -->
          <div class="mb-4 relative">
            <img
              :src="lockIcon"
              alt="PASSWORD"
              class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
            />
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Password"
              class="w-full pl-12 pr-10 py-2 bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <!-- toggle button -->
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 focus:outline-none"
            >
              <svg
                v-if="!showPassword"
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.958 9.958 0 012.223-3.592m3.412-2.406A9.953 9.953 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.958 9.958 0 01-4.043 5.197M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 3l18 18"
                />
              </svg>
            </button>

            <p
              v-if="!password && errorMessage"
              class="text-red-500 text-xs mt-1"
            >
              Please enter your password.
            </p>
          </div>

          <!-- global error -->
          <p
            v-if="identifier && password && errorMessage"
            class="text-red-600 text-sm mb-4 text-center"
          >
            {{ errorMessage }}
          </p>

          <p
            @click="goToForgotPass"
            class="text-xs text-right text-gray-500 mb-6 cursor-pointer hover:underline"
          >
            Forgot Password?
          </p>

          <button
            @click="handleLogin"
            class="w-full bg-primary text-white py-2 rounded-lg font-medium mb-4 hover:bg-secondary transition"
          >
            Sign In
          </button>

          <p class="text-xs text-center md:text-right text-gray-500">
            Don't have an account yet?
            <span
              @click="goToRegister"
              class="text-primary cursor-pointer hover:underline"
              >Register here</span
            >
          </p>
        </div>
      </div>
    </div>
  </section>

  <Footer />
</template>
