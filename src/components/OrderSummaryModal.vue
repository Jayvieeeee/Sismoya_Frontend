<script setup lang="ts">
import axiosInstance from "../utils/axios";
import { ref, onMounted, computed, watch } from "vue"
import type { ModalProduct } from "@/types"
import AddressSelectionModal from "@/components/AddressSelectionModal.vue"
import AddNewAddressModal from "@/components/AddNewAddressModal.vue"
import DateTimeModal from "@/components/DateTimeModal.vue"
import OrderPlacedModal from "@/components/OrderPlacedModal.vue"
import ErrorModal from "@/components/ErrorModal.vue"
import PayPalModal from "@/components/PaypalModal.vue"
import { getProfile } from "@/utils/auth"
import { getAddresses } from "@/utils/address"

// -------------------- State --------------------
const showError = ref(false);
const errorMessage = ref("");
const showPayPalModal = ref(false);
const pendingPayPalOrderId = ref<number | null>(null);
const orderPlacedModal = ref(false);

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
  products: ModalProduct[]
}>()

const emit = defineEmits<{
  (e: "close"): void
  (e: "place-order", orderData: any): void
}>()

// -------------------- Customer & Address --------------------
const customer = ref<User | null>(null)
const addresses = ref<Address[]>([])
const selectedAddress = ref<Address | null>(null)

const showAddressModal = ref(false)
const showAddAddressModal = ref(false)
const showDateTimeModal = ref(false)

// -------------------- Order Details --------------------
const pickUpTime = ref("")
const paymentMethod = ref("Cash") 

// Computed totals
const totalAmount = computed(() => props.products.reduce((sum, p) => sum + (p.price * p.qty), 0))
const totalQuantity = computed(() => props.products.reduce((sum, p) => sum + p.qty, 0))

// -------------------- Functions --------------------
const autoSelectAddress = (addressList: Address[]) => {
  if (addressList.length === 0) {
    selectedAddress.value = null
    return
  }
  const defaultAddress = addressList.find(a => a.isDefault)
  selectedAddress.value = defaultAddress || addressList[0]
}

const refreshAddresses = async () => {
  try {
    const fetched = await getAddresses()
    addresses.value = Array.isArray(fetched)
      ? fetched.map(a => ({
          id: a.address_id || a.id,
          label: a.label,
          full: a.address,
          isDefault: a.is_default
        }))
      : []
    autoSelectAddress(addresses.value)
  } catch (err) {
    console.error("Failed to load addresses:", err)
    selectedAddress.value = null
  }
}

watch(addresses, (newAddresses) => {
  if (newAddresses.length > 0 && !selectedAddress.value) autoSelectAddress(newAddresses)
})

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

async function handleAddressAdded(newAddress?: Address) {
  await refreshAddresses()
  if (newAddress && addresses.value.length === 1) {
    selectedAddress.value = addresses.value[0]
  }
  showAddAddressModal.value = false
}

// Payment map
const paymentMethodMap = { Paypal: "Paypal", "Cash": "CASH" }
const getBackendPaymentMethod = () => paymentMethodMap[paymentMethod.value as keyof typeof paymentMethodMap] || paymentMethod.value

// Images
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
}
function getImageUrl(imageUrl: string | undefined | null): string {
  if (!imageUrl) return "/placeholder.png"
  if (imageUrl.startsWith("http")) return imageUrl
  if (!imageUrl.startsWith("/")) return `https://sismoya.bsit3b.site/api/${imageUrl}`
  return `https://sismoya.bsit3b.site/api${imageUrl}`
}

// Validation
function validateOrder(): boolean {
  if (!selectedAddress.value) { errorMessage.value = "Please select an address."; showError.value = true; return false }
  if (!pickUpTime.value) { errorMessage.value = "Please select a pickup time."; showError.value = true; return false }
  if (!paymentMethod.value) { errorMessage.value = "Please select a payment method."; showError.value = true; return false }
  return true
}

const handlePlaceOrder = async () => {
  if (!customer.value || !props.products.length) return;
  if (!validateOrder()) return;

  const items = props.products.map(p => ({ gallon_id: p.id, quantity: p.qty, total_price: p.price * p.qty }));
  const payload = { 
    userId: customer.value.user_id, 
    pickup_datetime: pickUpTime.value, 
    payment_method: getBackendPaymentMethod(), 
    address_id: selectedAddress.value?.id || null, items };

  try {
    const res = await axiosInstance.post("/orders", payload);
    if (!res.data.success) throw new Error(res.data.message || "Order failed");

    if (paymentMethod.value === "Paypal") {
      pendingPayPalOrderId.value = res.data.order_id;
      showPayPalModal.value = true;
      emit('close'); // close order summary
    } else {
      // For Cash on Pickup, show success modal immediately
      orderPlacedModal.value = true;
      emit('place-order', payload);
      emit('close');
    }
  } catch (err: any) {
    console.error(err);
    errorMessage.value = err.response?.data?.message || err.message || "Order failed. Please try again.";
    showError.value = true;
  }
};

// -------------------- PayPal Handlers --------------------
const handlePayPalSuccess = (data: any) => {
  console.log('PayPal payment initiated successfully, waiting for completion...');
  // The OrderPlacedModal will be shown when PayPal redirects back to our success page
}

const handlePayPalError = (error: string) => {
  console.error('PayPal payment failed:', error);
  errorMessage.value = error;
  showError.value = true;
  showPayPalModal.value = false;
}

const handlePayPalClosed = () => {
  showPayPalModal.value = false;
  pendingPayPalOrderId.value = null;
}

</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 font-montserrat">
    <div class="bg-white rounded-2xl px-12 py-5 shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto relative">

      <!-- Close -->
      <button @click="emit('close')" class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl">✕</button>

      <!-- Title -->
      <h2 class="text-center text-xl font-semibold text-primary mb-6">Order Summary</h2>

      <!-- Customer Info -->
      <p class="mb-3 text-sm"><span class="font-medium">Customer Name:</span> {{ customer ? customer.first_name + " " + customer.last_name : "Loading..." }}</p>
      <p class="mb-3 text-sm"><span class="font-medium">Contact Number:</span> {{ customer ? customer.contact_no : "Loading..." }}</p>

      <!-- Address -->
      <div @click="showAddressModal = true" class="relative p-2 my-3 border border-black rounded-lg cursor-pointer hover:bg-gray-100">
        <p class="text-sm text-left ml-2 truncate">
          <span class="font-medium">Address:</span> {{ selectedAddress ? selectedAddress.full : "Add New Address" }}
        </p>
        <span class="absolute right-2 top-1/2 -translate-y-1/2 text-sm">&#11166;</span>
      </div>

      <!-- Pickup Time -->
      <div class="flex items-center justify-between mb-4">
        <label class="font-medium text-sm">Pick Up Time:</label>
        <div @click="showDateTimeModal = true" class="relative w-2/4 px-3 py-1 text-center text-sm border border-black rounded-lg cursor-pointer hover:bg-gray-100">
          {{ pickUpTime || "Select" }}
          <span class="absolute right-2 top-1/2 -translate-y-1/2 text-sm">&#11167;</span>
        </div>
      </div>

      <!-- Products Section -->
      <p class="font-medium text-sm mb-2">Gallons ({{ totalQuantity }}):</p>
      <div v-for="product in products" :key="product.id" class="flex items-center gap-4 my-3 p-3">
        <div class="flex-shrink-0 w-16 h-16 bg-white flex items-center justify-center">
          <img :src="getImageUrl(product.image_url)" :alt="product.type" class="w-12 h-12 object-contain" @error="handleImageError" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-start">
            <div>
              <p class="font-semibold text-sm truncate">{{ product.type }}</p>
              <p class="text-xs">Quantity: {{ product.qty }}</p>
              <p class="text-xs">Price: ₱{{ product.price.toFixed(2) }}</p>
            </div>
            <p class="font-semibold text-sm whitespace-nowrap ml-2">
              ₱{{ (product.price * product.qty).toFixed(2) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Total -->
      <div class="flex justify-between items-center mt-4 mb-4 pt-3 border-t border-gray-200">
        <span class="text-sm font-semibold text-gray-800">Total Amount:</span>
        <span class="text-lg font-bold">₱{{ totalAmount.toFixed(2) }}</span>
      </div>

      <!-- Payment Method -->
      <div class="flex items-center justify-between mb-6">
        <label class="font-semibold text-sm">Payment Method:</label>
        <div class="relative w-2/4">
          <select v-model="paymentMethod" class="w-full border border-black text-center text-sm rounded-lg px-3 py-1 appearance-none cursor-pointer">
            <option>Cash</option>
            <option>Paypal</option>
          </select>
          <span class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-sm">&#11167;</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-between gap-4">
        <button @click="emit('close')" class="flex-1 bg-primary text-white py-2 rounded-full hover:bg-gray-400 transition-colors font-medium">Back</button>
        <button @click="handlePlaceOrder" class="flex-1 bg-primary text-white py-2 rounded-full hover:bg-secondary transition-colors font-medium">Place Order</button>
      </div>
    </div>
  </div>

  <!-- Modals -->
  <AddressSelectionModal 
    :isOpen="showAddressModal" 
    :addresses="addresses" 
    :selectedAddress="selectedAddress"
    @close="showAddressModal = false" 
    @select="handleSelectAddress" 
    @add-new="handleAddNewAddress" />

  <AddNewAddressModal 
    :isOpen="showAddAddressModal" 
    @close="showAddAddressModal = false" 
    @address-added="handleAddressAdded" />

  <DateTimeModal :isOpen="showDateTimeModal" 
   @close="showDateTimeModal = false"
   @save="(value) => { pickUpTime = value }" />

  <!-- Order Placed Modal - Shows after successful payment -->
  <OrderPlacedModal 
    :isOpen="orderPlacedModal" 
    @close="orderPlacedModal = false" />

  <!-- PayPal Modal -->
  <PayPalModal 
    :isOpen="showPayPalModal"
    :amount="totalAmount.toFixed(2)"
    :orderId="pendingPayPalOrderId || undefined"
    @payment-success="handlePayPalSuccess"
    @payment-error="handlePayPalError"
    @closed="handlePayPalClosed"
  />

  <ErrorModal 
    v-if="showError" 
    :visible="showError" 
    :message="errorMessage" 
    @close="showError = false" />
</template>