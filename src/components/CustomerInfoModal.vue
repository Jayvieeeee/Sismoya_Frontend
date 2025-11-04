<script setup lang="ts">
import { ref, watch } from "vue"
import axiosInstance from "@/utils/axios"
import ViewDetailsModal from "@/components/ViewDetailsModal.vue"

const props = defineProps({
  show: Boolean,
  customerId: Number,
})

const emits = defineEmits(["close"])

const loading = ref(false)
const error = ref("")
const customer = ref<any>(null)
const savedAddresses = ref<any[]>([])
const orderHistory = ref<any[]>([])

// ✅ New states for the Order Details modal
const isOrderModalOpen = ref(false)
const selectedOrder = ref<any>(null)

watch(
  () => props.customerId,
  async (id) => {
    if (props.show && id) await fetchCustomerInfo(id)
  },
  { immediate: true }
)

const fetchCustomerInfo = async (id: number) => {
  loading.value = true
  error.value = ""
  customer.value = null
  savedAddresses.value = []
  orderHistory.value = []

  try {
    const response = await axiosInstance.get(`/admin/customers/${id}`)
    const data = response.data

    if (data.error) throw new Error(data.message || "API returned an error")

    customer.value = data.customer
    savedAddresses.value = data.saved_addresses || []
    orderHistory.value = data.order_history || []
  } catch (err: any) {
    error.value =
      err.response?.data?.message ||
      (err.response?.status === 404
        ? "Customer not found"
        : "Failed to load customer details")
  } finally {
    loading.value = false
  }
}

// ✅ Opens the Order Details Modal
const openOrderDetails = (order: any) => {
  selectedOrder.value = order
  isOrderModalOpen.value = true
}

// ✅ Closes the Order Details Modal
const closeOrderDetails = () => {
  isOrderModalOpen.value = false
  selectedOrder.value = null
}
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
  >
    <div class="bg-white w-full max-w-4xl rounded-2xl shadow-lg p-8 relative overflow-hidden">
      <!-- Close Button -->
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
      >
        &times;
      </button>

      <h2 class="text-xl font-semibold text-center mb-6 text-primary">
        Customer Information
      </h2>

      <div v-if="loading" class="text-center py-6">
        <div class="animate-spin inline-block rounded-full h-6 w-6 border-b-2 border-primary"></div>
        <p class="mt-2 text-gray-600">Loading details...</p>
      </div>

      <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md">
        {{ error }}
      </div>

      <div v-else-if="customer" class="space-y-6">
        <!-- Basic Info -->
        <div>
          <p><span class="font-semibold">Customer ID:</span> {{ customer.customer_id }}</p>
          <p><span class="font-semibold">Name:</span> {{ customer.name }}</p>
          <p><span class="font-semibold">Contact No.:</span> {{ customer.contact_no }}</p>
          <p><span class="font-semibold">Email:</span> {{ customer.email }}</p>
        </div>

        <!-- Saved Addresses Table -->
        <div>
          <h3 class="font-semibold mb-2 text-sm">Saved Addresses</h3>
          <div class="border rounded-lg overflow-auto max-h-48" style="max-width: 100%;">
            <table class="w-full text-sm text-left border-collapse min-w-[600px]">
              <thead class="bg-gray-100 text-gray-700">
                <tr>
                  <th class="px-4 py-2 border">Address ID</th>
                  <th class="px-4 py-2 border">Label</th>
                  <th class="px-4 py-2 border">Address</th>
                  <th class="px-4 py-2 border">Is Default</th>
                </tr>
              </thead>
              <tbody v-if="savedAddresses.length">
                <tr
                  v-for="address in savedAddresses"
                  :key="address.address_id"
                  class="hover:bg-gray-50"
                >
                  <td class="px-4 py-2 border">{{ address.address_id }}</td>
                  <td class="px-4 py-2 border">{{ address.label }}</td>
                  <td class="px-4 py-2 border">{{ address.address }}</td>
                  <td class="px-4 py-2 border text-center">
                    <span v-if="address.is_default" class="text-green-500 font-bold">✔</span>
                    <span v-else class="text-gray-400">—</span>
                  </td>
                </tr>
              </tbody>
              <tbody v-else>
                <tr>
                  <td colspan="4" class="px-4 py-3 border text-center text-gray-500 italic">
                    No saved addresses found
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 class="font-semibold mb-2 text-sm">Order History</h3>
          <div class="border rounded-lg overflow-auto max-h-48" style="max-width: 100%;">
            <table class="w-full text-sm text-left border-collapse min-w-[700px]">
              <thead class="bg-gray-100 text-gray-700">
                <tr>
                  <th class="px-4 py-2 border">Order ID</th>
                  <th class="px-4 py-2 border">Date</th>
                  <th class="px-4 py-2 border">Gallon</th>
                  <th class="px-4 py-2 border">Total Price</th>
                  <th class="px-4 py-2 border">Payment Method</th>
                  <th class="px-4 py-2 border">Status</th>
                  <th class="px-4 py-2 border">Actions</th>
                </tr>
              </thead>

              <tbody v-if="orderHistory.length">
                <tr
                  v-for="order in orderHistory"
                  :key="order.order_id"
                  class="hover:bg-gray-50"
                >
                  <td class="px-4 py-2 border">{{ order.order_id }}</td>
                  <td class="px-4 py-2 border">{{ order.created_at }}</td>
                  <td class="px-4 py-2 border">{{ order.gallon_name }}</td>
                  <td class="px-4 py-2 border text-right">₱{{ order.total_price }}</td>
                  <td class="px-4 py-2 border capitalize">{{ order.payment_method }}</td>
                  <td
                    class="px-4 py-2 border font-medium"
                    :class="{
                      'text-yellow-600': order.status === 'pending',
                      'text-green-600': order.status === 'completed',
                      'text-red-600': order.status === 'cancelled'
                    }"
                  >
                    {{ order.status }}
                  </td>
                  <td
                    class="px-4 py-2 border text-blue-600 underline cursor-pointer"
                    @click="openOrderDetails(order)"
                  >
                    View Details
                  </td>
                </tr>
              </tbody>

              <tbody v-else>
                <tr>
                  <td colspan="7" class="px-4 py-3 border text-center text-gray-500 italic">
                    No orders found
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div v-else class="text-center text-gray-500 italic py-6">
        No customer data found.
      </div>
    </div>

    <!-- Include the separate Order Details Modal -->
<ViewDetailsModal
  :isOpen="isOrderModalOpen"
  :selectedOrder="selectedOrder"
  :customerInfo="customer"
  @close="closeOrderDetails"
/>
 
  </div>
</template>
