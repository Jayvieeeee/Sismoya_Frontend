<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import LandingPageLayout from "@/Layout/LandingPageLayout.vue";
import { loginUser } from "@/api/loginApi";

const router = useRouter();

// form data
const identifier = ref("");
const password = ref("");
const showPassword = ref(false);

// feedback
const errorMessage = ref("");
const isLoading = ref(false);

// handle login
async function handleLogin() {
  if (isLoading.value) return;
  errorMessage.value = "";

  if (!identifier.value || !password.value) {
    errorMessage.value = "Please fill in all fields.";
    return;
  }

  try {
    isLoading.value = true;

    const res = await loginUser(identifier.value, password.value);

    if (res.error) {
      errorMessage.value = res.message || "Invalid credentials.";
      return;
    }

    if (!res.user || typeof res.user.role !== "string") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      errorMessage.value = "Login response is missing valid user information. Please try again.";
      return;
    }

    // Check if user is a rider and block access
    if (res.user.role === "rider") {
      errorMessage.value = "Rider access is not available on the web platform. Please use the mobile app to access your account.";
      // Clear any sensitive data that might have been returned
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return;
    }

    // Save only the needed data for non-rider users
    localStorage.setItem("token", res.token);
    localStorage.setItem("user", JSON.stringify(res.user));

    // Redirect based on role (excluding riders)
    if (res.user.role === "admin") {
      router.push("/adminDashboard");
    } else if (res.user.role === "customer") {
      router.push("/customerDashboard");
    } else {
      router.push("/");
    }
  } catch (err: any) {
    // Use backend error message if available in the error response
    if (err.response?.data?.message) {
      errorMessage.value = err.response.data.message;
    } else if (err.message) {
      errorMessage.value = err.message;
    } else {
      errorMessage.value = "An error occurred during login.";
    }
  } finally {
    isLoading.value = false;
  }
}

// handle Enter key
function handleEnterKey(event: KeyboardEvent) {
  if (event.key === "Enter") {
    handleLogin();
  }
}

onMounted(() => {
  window.addEventListener("keydown", handleEnterKey);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleEnterKey);
});

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
      class="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-16"
    >
      <!-- Heading -->
      <div class="text-center mb-8 max-w-xl">
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Login
        </h1>
        <p class="text-sm text-gray-500">
          Welcome back! Sign in to your account to manage your orders and   deliveries.
        </p>
      </div>

      <!-- Card -->
      <div
        class="w-full max-w-sm bg-gray-50 border border-gray-200 rounded-2xl p-8"
      >
        <!-- Identifier -->
        <div class="mb-4">
          <label class="block text-xs font-semibold text-gray-700 mb-1.5">
            Username or Email
          </label>
          <input
            v-model="identifier"
            type="text"
            placeholder="Enter your username or email"
            class="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
          <p
            v-if="!identifier && errorMessage"
            class="text-red-500 text-xs mt-1"
          >
            Please enter your email or username.
          </p>
        </div>

        <!-- Password -->
        <div class="mb-2 relative">
          <label class="block text-xs font-semibold text-gray-700 mb-1.5">
            Password
          </label>
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Enter your password"
            class="w-full px-4 py-2.5 pr-10 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
          <!-- Toggle -->
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600"
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

        <!-- Forgot password -->
        <div class="text-right mb-5">
          <span
            @click="goToForgotPass"
            class="text-xs font-medium text-blue-600 cursor-pointer hover:underline"
          >
            Forgot Password?
          </span>
        </div>

        <!-- Global Error -->
        <p
          v-if="errorMessage"
          class="text-red-600 text-sm mb-4 text-center"
        >
          {{ errorMessage }}
        </p>

        <!-- Login Button -->
        <button
          @click="handleLogin"
          :disabled="isLoading"
          class="w-full bg-blue-600 text-white py-2.5 rounded-full font-medium hover:bg-blue-700 transition disabled:opacity-70 flex items-center justify-center"
        >
          <svg
            v-if="isLoading"
            class="animate-spin h-5 w-5 mr-2 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
          {{ isLoading ? "Logging in..." : "Login" }}
        </button>

        <!-- Divider -->
        <div class="flex items-center gap-3 my-5">
          <div class="flex-1 h-px bg-gray-200"></div>
          <div class="flex-1 h-px bg-gray-200"></div>
        </div>

<!--
        <p class="text-xs text-center text-gray-500">
          Don't have an account yet?
          <br />
          <span
            @click="goToRegister"
            class="text-blue-600 font-medium cursor-pointer hover:underline"
          >
            Register here
          </span>
        </p>
        </p>
        -->
      </div>
    </section>
  </LandingPageLayout>
</template>