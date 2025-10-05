<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

import gallonImg from "@/assets/images/gallon.png";
import LandingPageLayout from "@/Layout/LandingPageLayout.vue";
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
    errorMessage.value = "Incorrect Username or Password.";
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
  <LandingPageLayout>
    <section
      class="relative font-montserrat min-h-screen bg-gradient-to-b from-white to-secondary flex flex-col md:flex-row items-center justify-center px-6 py-12 gap-10">
      <!-- Left side: Text + Image -->
      <div class="flex-1 ml-24 mt-12 text-center md:text-left flex flex-col items-center md:items-start">
        <h1 class="text-3xl md:text-5xl font-semibold text-primary mb-6">
          WELCOME TO <br />
          SISMOYA WATER!
        </h1>
        <img
          :src="gallonImg"
          alt="Water Jugs"
          class="w-full max-w-xs sm:max-w-sm lg:max-w-md"
        />
      </div>

      <!-- Right side: Login Form -->
      <div class="flex-1 ml-12 flex justify-center w-full">
        <div
          class="bg-white shadow-lg rounded-xl p-8 sm:p-10 w-7/12 max-w-sm md:max-w-md"
        >
          <h2 class="text-3xl font-medium text-center mb-6">Login</h2>

          <!-- Identifier -->
          <div class="mb-4 relative">
            <input
              v-model="identifier"
              type="text"
              placeholder="Email or Username"
              class="w-full pl-4 pr-4 py-3 text-sm bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <p
              v-if="!identifier && errorMessage"
              class="text-red-500 text-xs mt-1"
            >
              Please enter your email or username.
            </p>
          </div>

          <!-- Password -->
          <div class="mb-4 relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Password"
              class="w-full pl-4 pr-10 py-3 text-sm bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <!-- Toggle -->
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
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

          <!-- Global Error -->
          <p
            v-if="identifier && password && errorMessage"
            class="text-red-600 text-sm mb-4 text-center"
          >
            {{ errorMessage }}
          </p>

          <p
            @click="goToForgotPass"
            class="text-xs text-right font-medium mb-6 cursor-pointer hover:underline"
          >
            Forgot Password?
          </p>

          <button
            @click="handleLogin"
            class="w-full bg-primary text-white py-3 rounded-lg font-medium mb-4 hover:bg-secondary transition"
          >
            Login
          </button>

          <p class="text-xs text-center">
            Don't have an account yet?
            <span
              @click="goToRegister"
              class="text-primary cursor-pointer hover:underline"
              >Register here</span
            >
          </p>
        </div>
      </div>
    </section>
  </LandingPageLayout>
</template>

