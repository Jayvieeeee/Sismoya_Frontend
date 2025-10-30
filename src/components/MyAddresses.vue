<script setup lang="ts">
import { ref, onMounted } from "vue"
import { PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/outline'
import AddNewAddressModal from "@/components/AddNewAddressModal.vue"
import ConfirmModal from "@/components/ConfirmModal.vue"
import { getProfile } from "@/utils/auth"
import { getAddresses, deleteAddress } from "@/utils/address"

interface Address {
  id: number
  label: string
  address: string
  isDefault?: boolean
}

const addresses = ref<Address[]>([])
const modalOpen = ref(false)
const modalMode = ref<"add" | "edit">("add")
const selectedAddress = ref<Address | null>(null)
const userName = ref("")

// Confirm modal state
const showConfirmModal = ref(false)
const addressToDelete = ref<number | null>(null)

// ------------------ Fetch user profile ------------------
async function fetchProfile() {
  try {
    const profile = await getProfile()
    userName.value = `${profile.first_name} ${profile.last_name}`
  } catch (error) {
    console.error("Failed to load profile:", error)
  }
}

// ------------------ Fetch user addresses ------------------
async function fetchAddresses() {
  try {
    const res = await getAddresses()
    console.log("Fetched addresses from API:", res)

    addresses.value = Array.isArray(res)
      ? res.map((a: any) => ({
          id: a.address_id || a.id,
          label: a.label,
          address: a.address,
          isDefault: a.is_default,
        }))
      : []
    
    console.log("Processed addresses:", addresses.value)
  } catch (error) {
    console.error("Failed to load addresses:", error)
  }
}

// ------------------ Delete Address ------------------
function openDeleteConfirm(addressId: number) {
  addressToDelete.value = addressId
  showConfirmModal.value = true
}

async function confirmDelete() {
  if (!addressToDelete.value) return
  
  try {
    const result = await deleteAddress(addressToDelete.value)
    
    if (result.success) {
      await fetchAddresses() // Refresh the list
    } else {
      console.error("Delete failed - backend response:", result)
    }
  } catch (error: any) {
    
    // Log detailed error information for debugging
    if (error.response?.status === 404) {
      console.error("Available addresses:", addresses.value.map(a => ({ 
        id: a.id, 
        label: a.label,
        isDefault: a.isDefault 
      })))
    } else {
      console.error("Delete error:", error.message)
    }
  } finally {
    showConfirmModal.value = false
    addressToDelete.value = null
  }
}

function cancelDelete() {
  showConfirmModal.value = false
  addressToDelete.value = null
}

// ------------------ Modal Handling ------------------
function openAddModal() {
  modalMode.value = "add"
  selectedAddress.value = null
  modalOpen.value = true
}

function openEditModal(address: Address) {
  modalMode.value = "edit"
  selectedAddress.value = { ...address }
  modalOpen.value = true
}

function handleAddressSaved() {
  fetchAddresses()
  modalOpen.value = false
}

function closeModal() {
  modalOpen.value = false
}

onMounted(async () => {
  await fetchProfile()
  await fetchAddresses()
})
</script>

<template>
  <div class="pl-8 font-montserrat">
    <h2 class="text-2xl font-bold mb-6">My Addresses</h2>

    <!-- Address List -->
    <div
      class="max-w-xl space-y-4 overflow-y-auto"
      style="max-height: 24rem;" 
    >
      <div
        v-for="address in addresses"
        :key="address.id"
        class="border border-gray-300 rounded-xl p-4 relative hover:shadow-sm transition"
      >
        <!-- Action Buttons -->
        <div class="absolute top-4 right-4 flex gap-2">
          <!-- Edit Button -->
          <button
            @click="openEditModal(address)"
            class="text-gray-600 hover:text-blue-600 transition-colors"
            title="Edit address"
          >
            <PencilSquareIcon class="w-5 h-5" />
          </button>

          <!-- Delete Button -->
          <button
            @click="openDeleteConfirm(address.id)"
            class="text-red-500 hover:text-red-700 transition-colors"
            title="Delete address"
            :disabled="address.isDefault"
          >
            <TrashIcon class="w-5 h-5" />
          </button>
        </div>

        <h3 class="text-lg font-semibold mb-1">{{ address.label }}</h3>
        <p class="text-sm text-gray-700 mb-2">
          Address: {{ address.address }}
        </p>

        <span
          v-if="address.isDefault"
          class="text-xs font-medium text-gray-600"
        >
          Default
        </span>
      </div>
    </div>

    <!-- Add New Address Button -->
    <button
      @click="openAddModal"
      class="w-full border border-gray-300 rounded-xl p-4 mt-4 text-center hover:bg-gray-50 transition font-medium"
    >
      + Add New Address
    </button>

    <!-- Add/Edit Modal -->
    <AddNewAddressModal
      :isOpen="modalOpen"
      :mode="modalMode"
      :existingAddress="selectedAddress || undefined"
      @close="closeModal"
      @address-saved="handleAddressSaved"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmModal
      :visible="showConfirmModal"
      title="Confirm Delete"
      message="Are you sure you want to delete this address?"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>