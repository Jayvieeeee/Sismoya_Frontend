<script setup lang="ts">
import { ref, onMounted } from "vue"
import AddNewAddressModal from "@/components/AddNewAddressModal.vue"
import { getProfile } from "@/utils/auth"
import { getAddresses } from "@/utils/address"

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

    addresses.value = Array.isArray(res)
      ? res.map((a: any) => ({
          id: a.address_id || a.id,
          label: a.label,
          address: a.address,
          isDefault: a.is_default,
        }))
      : []
  } catch (error) {
    console.error("Failed to load addresses:", error)
  }
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
        <!-- Edit Button -->
        <button
          @click="openEditModal(address)"
          class="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
        >
          <svg
            class="w-5 h-5 align-middle"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414
              a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>

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
  </div>
</template>

