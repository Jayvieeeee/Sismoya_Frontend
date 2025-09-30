<script setup lang="ts">
import axiosInstance from "../utils/axios";
import { ref, onMounted } from "vue"
import type { ModalProduct } from "@/types"
import AddressSelectionModal from "@/components/AddressSelectionModal.vue"
import AddNewAddressModal from "@/components/AddNewAddressModal.vue"
import DateTimeModal from "@/components/DateTimeModal.vue"
import OrderPlacedModal from "@/components/OrderPlacedModal.vue"
import { getProfile } from "@/utils/auth"
import { getAddresses } from "@/utils/address"

// -------------------- Types --------------------
interface Address {
  id?: number
  label: string
  full: string
  isDefault?: boolean
}

interface User {
  user_id: number
  first_name: string
  last_name: string
  email: string
  contact_no: string
  role: string
}

// -------------------- Props --------------------
const props = defineProps<{
  isOpen: boolean
  product: ModalProduct
}>()

const emit = defineEmits<{
  (e: "close"): void
  (e: "place-order", orderData: any): void
}>()

// -------------------- Customer Info --------------------
const customer = ref<User | null>(null)

// -------------------- Address Handling --------------------
const addresses = ref<Address[]>([])
const selectedAddress = ref<Address | null>(null)

const showAddressModal = ref(false)
const showAddAddressModal = ref(false)
const showDateTimeModal = ref(false)
const orderPlacedModal = ref(false)

// Function to refresh addresses
const refreshAddresses = async () => {
  try {
    const fetched = await getAddresses()

    addresses.value = Array.isArray(fetched)
      ? fetched.map(a => ({
          id: a.address_id || a.id, // Backend might return 'address_id'
          label: a.label,
          full: a.address, // Backend returns 'address' field
          isDefault: a.is_default // Backend returns snake_case
        }))
      : []

    if (addresses.value.length > 0) {
      selectedAddress.value = addresses.value.find(a => a.isDefault) || addresses.value[0]
    } else {
      selectedAddress.value = null
    }
  } catch (err) {
    console.error("Failed to load addresses:", err)
    selectedAddress.value = null
  }
}

onMounted(async () => {
  try {
    const profile = await getProfile()
    customer.value = profile
    await refreshAddresses()
  } catch (err) {
    console.error("Failed to load profile or addresses:", err)
    selectedAddress.value = null
  }
})

function handleSelectAddress(address: Address) {
  selectedAddress.value = address
  showAddressModal.value = false
}

function handleAddNewAddress() {
  showAddressModal.value = false
  showAddAddressModal.value = true
}

// Handle when new address is added
async function handleAddressAdded() {
  console.log("🔄 New address added, refreshing addresses...")
  await refreshAddresses() // This will reload all addresses including the new one
  showAddAddressModal.value = false
}

// -------------------- Order Details --------------------
const pickUpTime = ref("")
const paymentMethod = ref("Paypal")

async function handlePlaceOrder() {
  if (!customer.value || !props.product) return

  // Calculate total price
  const totalPrice = props.product.price * props.product.qty

  const payload = {
    userId: customer.value.user_id,
    pickup_datetime: pickUpTime.value,
    payment_method: paymentMethod.value,
    address_id: selectedAddress.value?.id || null,
    items: [
      {
        gallon_id: props.product.id,
        quantity: props.product.qty,
        total_price: totalPrice
      }
    ]
  }

  try {
    const res = await axiosInstance.post("/orders", payload)
    console.log("SUCCESS RESPONSE:", res.data)
    if (res.data.success) {
      emit("close")               
      orderPlacedModal.value = true 
      emit("place-order", payload) 
    } else {
      alert(res.data.message)
    }
  } catch (err: any) {
    console.log("ERROR RESPONSE:", err.response?.data)
    
    // Show detailed error to user
    if (err.response?.data?.errors) {
      const errors = Object.values(err.response.data.errors).flat()
      alert("Validation errors:\n" + errors.join("\n"))
    } else {
      alert(err.response?.data?.message || 'Order failed. Please check the console for details.')
    }
  }
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 font-montserrat"
  >
    <div
      class="bg-white rounded-2xl px-12 py-5 shadow-lg w-full max-w-md relative"
    >
      <!-- Close -->
      <button
        @click="emit('close')"
        class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl"
      >
        ✕
      </button>

      <!-- Title -->
      <h2 class="text-center text-xl font-semibold text-primary mb-6">
        Order Summary
      </h2>

      <!-- Customer Info -->
      <p class="mb-3 text-sm">
        <span class="font-medium">Customer Name:</span>
        {{ customer ? customer.first_name + " " + customer.last_name : "Loading..." }}
      </p>
      <p class="mb-3 text-sm">
        <span class="font-medium">Contact Number:</span>
        {{ customer ? customer.contact_no : "Loading..." }}
      </p>

      <!-- Address -->
      <div
        @click="showAddressModal = true"
        class="relative p-2 my-3 border border-black rounded-lg cursor-pointer hover:bg-gray-100"
      >
        <p class="text-sm text-center truncate">
          {{ selectedAddress ? selectedAddress.full : "Add New Address" }}
        </p>
        <span class="absolute right-2 top-1/2 -translate-y-1/2 text-sm">&#11166;</span>
      </div>

      <!-- Pickup Time -->
      <div class="flex items-center justify-between mb-4">
        <label class="font-medium text-sm">Pick Up Time:</label>
        <div
          @click="showDateTimeModal = true"
          class="relative w-2/4 px-3 py-1 text-center text-sm border border-black rounded-lg cursor-pointer hover:bg-gray-100"
        >
          {{ pickUpTime || "Select" }}
          <span class="absolute right-2 top-1/2 -translate-y-1/2 text-sm">&#11167;</span>
        </div>
      </div>

      <!-- Product -->
      <p class="font-medium text-sm">Gallon:</p>
      <div class="flex items-center gap-4 my-3">
        <img
          :src="product.image_url"
          alt="Container"
          class="w-14 h-14 object-contain"
        />
        <span>{{ product.type }} x{{ product.qty }}</span>
        <span>{{ product.price.toFixed(2) }}</span>
      </div>

      <!-- Total -->
      <p class="text-sm font-semibold mb-4">
        Total Amount:
        <span class="ml-20 font-medium">{{
          (product.price * product.qty).toFixed(2)
        }}</span>
      </p>

      <!-- Payment Method -->
      <div class="flex items-center justify-between mb-6">
        <label class="font-semibold text-sm">Payment Method:</label>
        <div class="relative w-2/4">
          <select
            v-model="paymentMethod"
            class="w-full border border-black text-center text-sm rounded-lg px-3 py-1 appearance-none cursor-pointer"
          >
            <option>Paypal</option>
            <option>Cash on Pickup</option>
          </select>
          <span
            class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-sm"
          >
            &#11167;
          </span>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-between gap-4">
        <button
          @click="emit('close')"
          class="flex-1 bg-primary text-white py-2 rounded-full hover:bg-secondary"
        >
          Back
        </button>
        <button
          @click="handlePlaceOrder"
          class="flex-1 bg-primary text-white py-2 rounded-full hover:bg-secondary"
        >
          Place Order
        </button>
      </div>
    </div>
  </div>

  <!-- Modals -->
  <AddressSelectionModal
    :isOpen="showAddressModal"
    :addresses="addresses"
    @close="showAddressModal = false"
    @select="handleSelectAddress"
    @add-new="handleAddNewAddress"
  />
  <AddNewAddressModal
    :isOpen="showAddAddressModal"
    @close="showAddAddressModal = false"
    @address-added="handleAddressAdded" 
  />
  <DateTimeModal
    :isOpen="showDateTimeModal"
    @close="showDateTimeModal = false"
    @save="(value) => { pickUpTime = value }"
  />

  <OrderPlacedModal
    :isOpen="orderPlacedModal"
    @close="orderPlacedModal = false"
  />
</template>