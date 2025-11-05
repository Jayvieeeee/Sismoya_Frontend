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
          />
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
          />
        </div>

        <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
        <input
            v-model="newRider.username"
            type="text"
            required
            class="w-full border rounded-md px-3 py-2 focus:ring focus:ring-blue-200"
            placeholder="Enter username"
        />
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
          />
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
          />
        </div>

        <!-- Password with Eye Icon -->
        <div class="relative">
        <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <div class="relative">
            <input
            :type="showPassword ? 'text' : 'password'"
            v-model="newRider.password"
            required
            minlength="6"
            class="w-full border rounded-md px-3 py-2 pr-10 focus:ring focus:ring-blue-200"
            placeholder="Enter password"
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
            :disabled="saving"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {{ saving ? 'Saving...' : 'Add Rider' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits, defineModel } from "vue"
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
}

async function submitAddRider() {
  // ✅ Frontend validation for PH contact number
  const contact = newRider.value.contact_no.replace(/[^0-9]/g, "") // remove spaces/dashes

  if (!/^09[0-9]{9}$/.test(contact)) {
    return Swal.fire({
      title: "Invalid Contact Number",
      text: "Contact number must start with 09 and be exactly 11 digits.",
      icon: "warning",
      confirmButtonColor: "#f59e0b",
    })
  }

  try {
    saving.value = true

    // Update sanitized contact number before sending
    const payload = { ...newRider.value, contact_no: contact }

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
