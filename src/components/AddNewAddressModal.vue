<script setup lang="ts">
import { ref, watch } from "vue";
import axiosInstance from "../utils/axios";

const props = defineProps<{
  isOpen: boolean;
  mode?: "add" | "edit";
  existingAddress?: {
    id?: number;
    label?: string;
    address?: string;
    isDefault?: boolean;
  };
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "address-added"): void;
}>();

const label = ref("");
const address = ref("");
const isDefault = ref(false);
const isLoading = ref(false);

// Confirm modal state
const showConfirmModal = ref(false);
const confirmModalConfig = ref({
  title: "",
  message: "",
  type: "success" as "warning" | "success" | "error"
});

watch(
  () => props.existingAddress,
  (val) => {
    if (props.mode === "edit" && val) {
      label.value = val.label || "";
      address.value = val.address || "";
      isDefault.value = !!val.isDefault;
    } else {
      label.value = "";
      address.value = "";
      isDefault.value = false;
    }
  },
  { immediate: true }
);

async function handleSave() {
  if (!label.value || !address.value) {
    alert("Please fill in all fields");
    return;
  }

  isLoading.value = true;

  try {
    const payload = {
      label: label.value,
      address: address.value,
      is_default: isDefault.value,
    };

    if (props.mode === "edit" && props.existingAddress?.id) {
      const response = await axiosInstance.put(
        `/addresses/${props.existingAddress.id}`,
        payload
      );
      if (response.data.success) {
        // Show success confirmation modal for edit
        showConfirmModal.value = true;
        confirmModalConfig.value = {
          title: "Success!",
          message: "Address has been updated successfully.",
          type: "success"
        };
      } else {
        alert(response.data.message || "Failed to update address");
      }
    } else {
      const response = await axiosInstance.post("/addresses", payload);
      if (response.data.success) {
        // Show success confirmation modal for add
        showConfirmModal.value = true;
        confirmModalConfig.value = {
          title: "Success!",
          message: "Address has been added successfully.",
          type: "success"
        };
      } else {
        alert(response.data.message || "Failed to add address");
      }
    }
  } catch (err: any) {
    alert(err.response?.data?.message || "Something went wrong. Please try again.");
  } finally {
    isLoading.value = false;
  }
}

function handleConfirm() {
  // Close both modals and reload the page
  showConfirmModal.value = false;
  emit("address-added");
  emit("close");
  window.location.reload();
}

function handleCloseConfirm() {
  showConfirmModal.value = false;
}
</script>

<template>
  <!-- Address Modal -->
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 font-montserrat"
  >
    <div class="bg-white rounded-xl shadow-lg p-6 w-[500px] h-[400px] relative">
      <!-- Close -->
      <button
        @click="emit('close')"
        class="absolute top-3 right-4 text-gray-500 hover:text-red-500 text-xl"
        :disabled="isLoading"
      >
        ✕
      </button>

      <!-- Title -->
      <h2 class="text-center text-lg font-semibold text-primary mb-12">
        {{ mode === "edit" ? "Update Address" : "Add New Address" }}
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
        {{ isLoading ? "Saving..." : mode === "edit" ? "Update" : "Save" }}
      </button>
    </div>
  </div>

  <!-- Success Confirmation Modal -->
  <div
    v-if="showConfirmModal"
    class="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]"
  >
    <div
      class="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 relative"
    >
      <!-- Close Button -->
      <button
        @click="handleCloseConfirm"
        class="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-lg"
      >
        ✕
      </button>

      <!-- Icon -->
      <div class="flex justify-center mb-4">
        <div
          class="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center"
        >
          <svg class="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
      </div>

      <!-- Title -->
      <h2 class="text-center text-gray-800 text-xl font-semibold mb-3">
        {{ confirmModalConfig.title }}
      </h2>

      <!-- Message -->
      <p class="text-center text-gray-600 mb-6">
        {{ confirmModalConfig.message }}
      </p>

      <!-- Actions -->
      <div class="flex justify-center gap-3">
        <button
          @click="handleConfirm"
          class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
        >
          OK
        </button>
      </div>
    </div>
  </div>
</template>