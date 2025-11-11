<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
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
      class="relative font-montserrat min-h-screen bg-gradient-to-b from-white to-secondary flex flex-col md:flex-row items-center justify-center px-6 py-12 gap-10"
    >
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
            v-if="errorMessage"
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

          <!-- ✅ Login Button -->
          <button
            @click="handleLogin"
            :disabled="isLoading"
            class="w-full bg-primary text-white py-3 rounded-lg font-medium mb-4 hover:bg-secondary transition disabled:opacity-70 flex items-center justify-center"
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