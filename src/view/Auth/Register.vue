<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"
import { registerUser } from "@/api/registerApi"
import LandingPageLayout from "@/Layout/LandingPageLayout.vue"
import SuccessModal from "@/components/SuccessModal.vue"
import { EyeIcon, EyeSlashIcon } from "@heroicons/vue/24/outline"

const router = useRouter()

// Form state
const firstName = ref("")
const lastName = ref("")
const username = ref("")
const email = ref("")
const password = ref("")
const confirmPassword = ref("")
const contactNo = ref("")
const address = ref("")
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const role = ref("user")

// Status & errors
const errors = ref<Record<string, string>>({})
const successVisible = ref(false)
const isLoading = ref(false)

const validatePasswords = () => {
  if (password.value !== confirmPassword.value) {
    errors.value.confirmPassword = "Passwords do not match"
    return false
  }
  return true
}

const handleRegister = async () => {
  if (isLoading.value) return

  errors.value = {}

  // Frontend password matching validation
  if (!validatePasswords()) {
    return
  }

  try {
    isLoading.value = true

    const payload = {
      first_name: firstName.value,
      last_name: lastName.value,
      username: username.value,
      email: email.value,
      password: password.value, // Only send the password field to backend
      contact_no: contactNo.value,
      address: address.value,
      role: role.value,
    }

    await registerUser(payload)
    successVisible.value = true
  } catch (err: any) {
    if (err.response?.data?.errors) {
      errors.value = err.response.data.errors
    } else {
      errors.value.general = err.response?.data?.message || "Registration failed"
    }
  } finally {
    isLoading.value = false
  }
}

function goToLogin() {
  router.push("/login")
}

function handleOk() {
  successVisible.value = false
  router.push("/login")
}

function clearError(field: string) {
  if (errors.value[field]) {
    delete errors.value[field]
  }
}
</script>

<template>
  <LandingPageLayout>
    <section
      class="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-16"
    >
      <!-- Heading -->
      <div class="text-center mb-8 max-w-xl">
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Register
        </h1>
        <p class="text-sm text-gray-500">
          Create a new account to start ordering fresh, clean water delivered to your home.
        </p>
      </div>

      <!-- Card -->
      <div
        class="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-8"
      >
        <!-- Name -->
        <div class="flex flex-col sm:flex-row gap-4 mb-4">
          <div class="w-full sm:w-1/2">
            <label class="block text-xs font-semibold text-gray-700 mb-1.5">
              First Name
            </label>
            <input
              v-model="firstName"
              type="text"
              placeholder="First name"
              class="w-full px-4 py-2.5 text-sm bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
            <p v-if="errors.first_name" class="text-red-500 text-xs mt-1">
              {{ errors.first_name }}
            </p>
          </div>
          <div class="w-full sm:w-1/2">
            <label class="block text-xs font-semibold text-gray-700 mb-1.5">
              Last Name
            </label>
            <input
              v-model="lastName"
              type="text"
              placeholder="Last name"
              class="w-full px-4 py-2.5 text-sm bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
            <p v-if="errors.last_name" class="text-red-500 text-xs mt-1">
              {{ errors.last_name }}
            </p>
          </div>
        </div>

        <!-- Email -->
        <div class="mb-4">
          <label class="block text-xs font-semibold text-gray-700 mb-1.5">
            Email Address
          </label>
          <input
            v-model="email"
            type="email"
            placeholder="your@email.com"
            class="w-full px-4 py-2.5 text-sm bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
          <p v-if="errors.email" class="text-red-500 text-xs mt-1">
            {{ errors.email }}
          </p>
        </div>

        <!-- Contact -->
        <div class="mb-4">
          <label class="block text-xs font-semibold text-gray-700 mb-1.5">
            Contact Number
          </label>
          <input
            v-model="contactNo"
            type="text"
            placeholder="09XXXXXXXXX"
            class="w-full px-4 py-2.5 text-sm bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
          <p v-if="errors.contact_no" class="text-red-500 text-xs mt-1">
            {{ errors.contact_no }}
          </p>
        </div>

        <!-- Username -->
        <div class="mb-4">
          <label class="block text-xs font-semibold text-gray-700 mb-1.5">
            Username
          </label>
          <input
            v-model="username"
            type="text"
            placeholder="Choose a username"
            class="w-full px-4 py-2.5 text-sm bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
          <p v-if="errors.username" class="text-red-500 text-xs mt-1">
            {{ errors.username }}
          </p>
        </div>

        <!-- Password -->
        <div class="mb-4 relative">
          <label class="block text-xs font-semibold text-gray-700 mb-1.5">
            Password
          </label>
          <input
            v-model="password"
            @input="clearError('confirmPassword')"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Create a strong password"
            class="w-full px-4 py-2.5 pr-10 text-sm bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
          <!-- Toggle -->
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600 transition-colors"
          >
            <EyeSlashIcon v-if="showPassword" class="h-5 w-5" />
            <EyeIcon v-else class="h-5 w-5" />
          </button>

          <p v-if="errors.password" class="text-red-500 text-xs mt-1">
            {{ errors.password }}
          </p>
        </div>

        <!-- Confirm Password -->
        <div class="mb-2 relative">
          <label class="block text-xs font-semibold text-gray-700 mb-1.5">
            Confirm Password
          </label>
          <input
            v-model="confirmPassword"
            @input="clearError('confirmPassword')"
            :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="Re-enter your password"
            class="w-full px-4 py-2.5 pr-10 text-sm bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
          <!-- Toggle -->
          <button
            type="button"
            @click="showConfirmPassword = !showConfirmPassword"
            class="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600 transition-colors"
          >
            <EyeSlashIcon v-if="showConfirmPassword" class="h-5 w-5" />
            <EyeIcon v-else class="h-5 w-5" />
          </button>

          <p v-if="errors.confirmPassword" class="text-red-500 text-xs mt-1">
            {{ errors.confirmPassword }}
          </p>
        </div>

        <!-- General Error -->
        <p
          v-if="errors.general"
          class="text-red-600 text-sm mt-3 text-center"
        >
          {{ errors.general }}
        </p>

        <!-- Register Button -->
        <button
          @click="handleRegister"
          :disabled="isLoading"
          class="w-full bg-blue-600 text-white py-2.5 rounded-full font-medium mt-5 hover:bg-blue-700 transition disabled:opacity-70 flex items-center justify-center"
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
          {{ isLoading ? "Creating account..." : "Create Account" }}
        </button>

        <!-- Divider -->
        <div class="flex items-center gap-3 my-5">
          <div class="flex-1 h-px bg-gray-200"></div>
          <span class="text-xs text-gray-400">or</span>
          <div class="flex-1 h-px bg-gray-200"></div>
        </div>

        <p class="text-xs text-center text-gray-500">
          Already have an account?
          <span
            @click="goToLogin"
            class="text-blue-600 font-medium cursor-pointer hover:underline"
            >Login here</span
          >
        </p>
      </div>
    </section>

    <!-- Success Modal -->
    <SuccessModal
      :visible="successVisible"
      title="Registration Successful!"
      message="Your account has been created successfully."
      @ok="handleOk"
    />
  </LandingPageLayout>
</template>