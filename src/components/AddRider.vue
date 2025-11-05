<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white w-full max-w-md rounded-lg shadow-lg p-6">
      <h2 class="text-xl font-semibold mb-4 text-center text-gray-800">Add New Delivery Boy</h2>

      <form @submit.prevent="submitAddRider" class="flex flex-col space-y-3">
        <!-- First Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
          <input
            v-model="newRider.first_name"
            type="text"
            required
            class="w-full border rounded-md px-3 py-2 focus:ring focus:ring-blue-200"
            placeholder="Enter first name"
            @blur="validateFirstName"
          />
          <p v-if="errors.first_name" class="text-red-500 text-xs mt-1">{{ errors.first_name }}</p>
        </div>

        <!-- Last Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
          <input
            v-model="newRider.last_name"
            type="text"
            required
            class="w-full border rounded-md px-3 py-2 focus:ring focus:ring-blue-200"
            placeholder="Enter last name"
            @blur="validateLastName"
          />
          <p v-if="errors.last_name" class="text-red-500 text-xs mt-1">{{ errors.last_name }}</p>
        </div>

        <!-- Username -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            v-model="newRider.username"
            type="text"
            required
            class="w-full border rounded-md px-3 py-2 focus:ring focus:ring-blue-200"
            placeholder="Enter username"
            @blur="validateUsername"
          />
          <p v-if="errors.username" class="text-red-500 text-xs mt-1">{{ errors.username }}</p>
        </div>

        <!-- Email -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            v-model="newRider.email"
            type="email"
            required
            class="w-full border rounded-md px-3 py-2 focus:ring focus:ring-blue-200"
            placeholder="Enter email address"
            @blur="validateEmail"
          />
          <p v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email }}</p>
        </div>

        <!-- Contact Number -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
          <input
            v-model="newRider.contact_no"
            type="text"
            required
            maxlength="11"
            class="w-full border rounded-md px-3 py-2 focus:ring focus:ring-blue-200"
            placeholder="Enter contact number"
            @blur="validateContactNumber"
          />
          <p v-if="errors.contact_no" class="text-red-500 text-xs mt-1">{{ errors.contact_no }}</p>
        </div>

        <!-- Password with Eye Icon -->
        <div class="relative">
          <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div class="relative">
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="newRider.password"
              required
              minlength="8"
              class="w-full border rounded-md px-3 py-2 pr-10 focus:ring focus:ring-blue-200"
              placeholder="Enter password"
              @blur="validatePassword"
            />
            <!-- Eye Icon Toggle (centered properly) -->
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <component
                :is="showPassword ? EyeSlashIcon : EyeIcon"
                class="h-5 w-5"
              />
            </button>
          </div>
          <p v-if="errors.password" class="text-red-500 text-xs mt-1">{{ errors.password }}</p>
          <p v-else class="text-gray-500 text-xs mt-1">
            Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character
          </p>
        </div>

        <!-- Buttons -->
        <div class="flex justify-end space-x-2 mt-4">
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="saving || hasErrors"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {{ saving ? 'Saving...' : 'Add Rider' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits, defineModel, computed } from "vue"
import axiosInstance from "@/utils/axios"
import { EyeIcon, EyeSlashIcon } from "@heroicons/vue/24/solid"
import Swal from "sweetalert2"

const emit = defineEmits(["rider-added"])
const show = defineModel<boolean>({ required: true })

const saving = ref(false)
const showPassword = ref(false)

const newRider = ref({
  first_name: "",
  last_name: "",
  email: "",
  contact_no: "",
  password: "",
  username: "", 
})

const errors = ref({
  first_name: "",
  last_name: "",
  email: "",
  contact_no: "",
  password: "",
  username: "",
})

const hasErrors = computed(() => {
  return Object.values(errors.value).some(error => error !== "") || 
         Object.values(newRider.value).some(value => value === "")
})

function clearErrors() {
  errors.value = {
    first_name: "",
    last_name: "",
    email: "",
    contact_no: "",
    password: "",
    username: "",
  }
}

function validateFirstName() {
  const name = newRider.value.first_name.trim()
  errors.value.first_name = ""

  if (name.length < 2 || name.length > 50) {
    errors.value.first_name = "First name must be between 2 and 50 characters"
    return false
  }

  if (!/^[a-zA-Z\s\-\'\.]+$/.test(name)) {
    errors.value.first_name = "First name can only contain letters, spaces, hyphens, and apostrophes"
    return false
  }

  return true
}

function validateLastName() {
  const name = newRider.value.last_name.trim()
  errors.value.last_name = ""

  if (name.length < 2 || name.length > 50) {
    errors.value.last_name = "Last name must be between 2 and 50 characters"
    return false
  }

  if (!/^[a-zA-Z\s\-\'\.]+$/.test(name)) {
    errors.value.last_name = "Last name can only contain letters, spaces, hyphens, and apostrophes"
    return false
  }

  return true
}

function validateEmail() {
  const email = newRider.value.email.trim()
  errors.value.email = ""

  // Basic email format validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.value.email = "Invalid email format"
    return false
  }

  // Check if email is lowercase
  if (email !== email.toLowerCase()) {
    errors.value.email = "Email must be in lowercase"
    return false
  }

  // Extract domain for Gmail validation
  const [user, domain] = email.split('@')
  
  // Gmail specific validation
  if (domain === "gmail.com" && user.length < 7) {
    errors.value.email = "Gmail address must have at least 7 characters before @"
    return false
  }

  return true
}

function validateContactNumber() {
  const contactNo = newRider.value.contact_no.replace(/[^0-9]/g, "")
  errors.value.contact_no = ""

  if (!/^09[0-9]{9}$/.test(contactNo)) {
    errors.value.contact_no = "Contact number must start with '09' and be exactly 11 digits"
    return false
  }

  return true
}

function validateUsername() {
  const username = newRider.value.username.trim()
  errors.value.username = ""

  if (username.length < 3 || username.length > 20) {
    errors.value.username = "Username must be between 3 and 20 characters"
    return false
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.value.username = "Username can only contain letters, numbers, and underscores"
    return false
  }

  return true
}

function validatePassword() {
  const password = newRider.value.password
  errors.value.password = ""

  const passwordErrors = []

  if (password.length < 8) {
    passwordErrors.push("at least 8 characters")
  }
  if (!/[A-Z]/.test(password)) {
    passwordErrors.push("at least one uppercase letter")
  }
  if (!/[a-z]/.test(password)) {
    passwordErrors.push("at least one lowercase letter")
  }
  if (!/[0-9]/.test(password)) {
    passwordErrors.push("at least one number")
  }
  if (!/[\W]/.test(password)) {
    passwordErrors.push("at least one special character")
  }

  if (passwordErrors.length > 0) {
    errors.value.password = "Password must contain " + passwordErrors.join(", ")
    return false
  }

  return true
}

function validateAllFields(): boolean {
  clearErrors()
  
  const validations = [
    validateFirstName(),
    validateLastName(),
    validateUsername(),
    validateEmail(),
    validateContactNumber(),
    validatePassword()
  ]

  return validations.every(validation => validation)
}

function closeModal() {
  show.value = false
  resetForm()
}

function resetForm() {
  newRider.value = {
    first_name: "",
    last_name: "",
    email: "",
    contact_no: "",
    password: "",
    username: "", 
  }
  clearErrors()
}

async function submitAddRider() {
  if (!validateAllFields()) {
    Swal.fire({
      title: "Validation Error",
      text: "Please fix all validation errors before submitting.",
      icon: "warning",
      confirmButtonColor: "#f59e0b",
    })
    return
  }

  try {
    saving.value = true
    
    const payload = { 
      ...newRider.value, 
      contact_no: newRider.value.contact_no.replace(/[^0-9]/g, ""),
      email: newRider.value.email.toLowerCase(),
      username: newRider.value.username.toLowerCase()
    }

    const { data } = await axiosInstance.post("/admin/add-rider", payload)

    if (!data.error) {
      await Swal.fire({
        title: "Rider Added!",
        text: `${newRider.value.first_name} ${newRider.value.last_name} has been added successfully.`,
        icon: "success",
        confirmButtonColor: "#2563eb",
      })

      emit("rider-added")
      closeModal()
    } else {
      Swal.fire({
        title: "Failed to Add Rider",
        text: data.message || "An error occurred while adding the rider.",
        icon: "error",
        confirmButtonColor: "#ef4444",
      })
    }
  } catch (error: any) {
    Swal.fire({
      title: "Error",
      text: error.response?.data?.message || "Failed to add rider.",
      icon: "error",
      confirmButtonColor: "#ef4444",
    })
  } finally {
    saving.value = false
  }
}
</script>