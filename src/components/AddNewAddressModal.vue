<script setup lang="ts">
import { ref } from "vue"
import axiosInstance from "../utils/axios"

const { isOpen } = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: "close"): void
  (e: "address-added"): void  // Add this event
}>()

const label = ref("")
const address = ref("")
const isDefault = ref(false)
const isLoading = ref(false)

async function handleSave() {
  if (!label.value || !address.value) {
    alert("Please fill in all fields")
    return
  }

  isLoading.value = true

  try {
    const payload = {
      label: label.value,
      address: address.value,
      is_default: isDefault.value
    }

    console.log("📦 Sending address payload:", payload)

    const response = await axiosInstance.post("/addresses", payload)
    
    if (response.data.success) {
      console.log("✅ Address added successfully:", response.data)
      
      // Reset form
      label.value = ""
      address.value = ""
      isDefault.value = false
      
      // Emit address-added event before closing
      emit("address-added")
      emit("close")
    } else {
      alert(response.data.message || "Failed to add address")
    }
  } catch (err: any) {
    console.error("❌ Error adding address:", err)
    console.error("❌ Full error:", err.response?.data)
    alert(err.response?.data?.message || "Failed to add address. Please try again.")
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 font-montserrat">
    <div class="bg-white rounded-xl shadow-lg p-6 w-[500px] h-[400px] relative">
      <!-- Close -->
      <button 
        @click="emit('close')" 
        class="absolute top-3 right-4 text-gray-500 hover:text-red-500 text-xl"
        :disabled="isLoading"
      >✕</button>

      <!-- Title -->
      <h2 class="text-center text-lg font-semibold text-primary mb-12">
        Add New Address
      </h2>

      <!-- Label -->
      <div class="mb-10 flex items-center">
        <label class="w-20 text-sm font-medium">Label:</label>
        <input
          v-model="label"
          type="text"
          :disabled="isLoading"
          placeholder="e.g., Home, Office"
          class="flex-1 border border-black rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
        />
      </div>

      <!-- Address -->
      <div class="mb-10 flex items-center">
        <label class="w-20 text-sm font-medium">Address:</label>
        <input
          v-model="address"
          type="text"
          :disabled="isLoading"
          placeholder="Enter your full address"
          class="flex-1 border border-black rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
        />
      </div>

      <!-- Default Switch -->
      <div class="mb-10 flex items-center">
        <label class="w-28 text-sm font-medium">Set as Default</label>
        <label class="relative inline-flex items-center cursor-pointer flex-1">
          <input 
            type="checkbox" 
            v-model="isDefault" 
            :disabled="isLoading"
            class="sr-only peer" 
          />
          <div
            class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary peer-disabled:bg-gray-300
                   after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                   after:bg-white after:rounded-full after:h-5 after:w-5 
                   after:transition-all peer-checked:after:translate-x-full peer-disabled:after:bg-gray-400"
          ></div>
        </label>
      </div>

      <!-- Save Button -->
      <button 
        @click="handleSave" 
        :disabled="isLoading"
        class="w-1/3 mx-auto block bg-primary text-xs text-white py-3 rounded-lg hover:bg-secondary transition disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {{ isLoading ? "Saving..." : "Save" }}
      </button>
    </div>
  </div>
</template>