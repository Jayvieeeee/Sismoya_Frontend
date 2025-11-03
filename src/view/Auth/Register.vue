<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"
import { registerUser } from "@/api/registerApi"
import LandingPageLayout from "@/Layout/LandingPageLayout.vue"
import SuccessModal from "@/components/SuccessModal.vue"
import gallonImg from "@/assets/images/gallon.png"
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

      <!-- Right side: Register Form -->
      <div class="flex-1 ml-12 flex justify-center w-full">
        <div
          class="bg-white shadow-lg rounded-xl p-8 sm:p-10 w-7/12 max-w-sm md:max-w-md"
        >
          <h2 class="text-3xl font-medium text-center mb-6">Register</h2>

          <!-- Name -->
          <div class="flex flex-col sm:flex-row gap-4 mb-4">
            <div class="w-full sm:w-1/2">
              <input
                v-model="firstName"
                type="text"
                placeholder="First Name"
                class="w-full px-4 py-3 text-sm bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <p v-if="errors.first_name" class="text-red-500 text-xs mt-1">
                {{ errors.first_name }}
              </p>
            </div>
            <div class="w-full sm:w-1/2">
              <input
                v-model="lastName"
                type="text"
                placeholder="Last Name"
                class="w-full px-4 py-3 text-sm bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <p v-if="errors.last_name" class="text-red-500 text-xs mt-1">
                {{ errors.last_name }}
              </p>
            </div>
          </div>

          <!-- Email -->
          <div class="mb-4">
            <input
              v-model="email"
              type="email"
              placeholder="Email"
              class="w-full pl-4 pr-4 py-3 text-sm bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <p v-if="errors.email" class="text-red-500 text-xs mt-1">
              {{ errors.email }}
            </p>
          </div>

          <!-- Contact -->
          <div class="mb-4">
            <input
              v-model="contactNo"
              type="text"
              placeholder="Contact No"
              class="w-full pl-4 pr-4 py-3 text-sm bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <p v-if="errors.contact_no" class="text-red-500 text-xs mt-1">
              {{ errors.contact_no }}
            </p>
          </div>

          <!-- Username -->
          <div class="mb-4">
            <input
              v-model="username"
              type="text"
              placeholder="Username"
              class="w-full pl-4 pr-4 py-3 text-sm bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <p v-if="errors.username" class="text-red-500 text-xs mt-1">
              {{ errors.username }}
            </p>
          </div>

          <!-- Password -->
          <div class="mb-4 relative">
            <input
              v-model="password"
              @input="clearError('confirmPassword')"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Password"
              class="w-full pl-4 pr-10 py-3 text-sm bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <!-- Toggle -->
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <EyeSlashIcon v-if="showPassword" class="h-5 w-5" />
              <EyeIcon v-else class="h-5 w-5" />
            </button>

            <p v-if="errors.password" class="text-red-500 text-xs mt-1">
              {{ errors.password }}
            </p>
          </div>

          <!-- Confirm Password -->
          <div class="mb-4 relative">
            <input
              v-model="confirmPassword"
              @input="clearError('confirmPassword')"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="Confirm Password"
              class="w-full pl-4 pr-10 py-3 text-sm bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <!-- Toggle -->
            <button
              type="button"
              @click="showConfirmPassword = !showConfirmPassword"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <EyeSlashIcon v-if="showConfirmPassword" class="h-5 w-5" />
              <EyeIcon v-else class="h-5 w-5" />
            </button>

            <p v-if="errors.confirmPassword" class="text-red-500 text-xs mt-1">
              {{ errors.confirmPassword }}
            </p>
          </div>

          <!-- General Error -->
          <p v-if="errors.general" class="text-red-600 text-sm mb-4 text-center">
            {{ errors.general }}
          </p>

          <!-- ✅ Register Button -->
          <button
            @click="handleRegister"
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
            {{ isLoading ? "Registering..." : "Register" }}
          </button>

          <p class="text-xs text-center">
            Already have an account yet?
            <span
              @click="goToLogin"
              class="text-primary cursor-pointer hover:underline"
              >Login here</span
            >
          </p>
        </div>
      </div>
    </section>

    <!-- ✅ Success Modal -->
    <SuccessModal
      :visible="successVisible"
      title="Registration Successful!"
      message="Your account has been created successfully."
      @ok="handleOk"
    />
  </LandingPageLayout>
</template>