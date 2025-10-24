<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4"
  >
    <div
      class="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto"
    >
      <!-- Close Button -->
      <button
        @click="$emit('update:modelValue', false)"
        class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
      >
        ×
      </button>

      <!-- Title -->
      <h2 class="text-2xl font-bold text-center text-blue-800 mb-6">
        Rider Information
      </h2>

      <!-- Rider Info -->
      <div class="grid sm:grid-cols-2 gap-4 text-gray-700 mb-6">
        <p><strong>Rider ID:</strong> {{ riderId || 'N/A' }}</p>
        <p><strong>Name:</strong> {{ riderName || 'N/A' }}</p>
        <p><strong>Contact No.:</strong> {{ contactNo || 'N/A' }}</p>
        <p><strong>Email:</strong> {{ riderEmail || 'N/A' }}</p>

        <p class="flex items-center gap-2">
          <strong>Status:</strong>
          <span class="ml-2 font-medium" :class="riderStatus === 'Active' ? 'text-green-600' : 'text-red-600'">
            {{ riderStatus || 'N/A' }}
          </span>
          <button
            class="ml-2 px-3 py-1 text-xs text-white rounded-md transition-colors"
            :class="riderStatus === 'Active' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'"
            @click="toggleStatus"
            :disabled="!riderId"
          >
            {{ riderStatus === 'Active' ? 'Deactivate' : 'Activate' }}
          </button>
        </p>
      </div>

      <!-- Delivery History -->
      <div>
        <h3 class="text-lg font-semibold text-blue-700 mb-3">
          Delivery History
        </h3>

        <div
          v-if="!deliveryHistory || deliveryHistory.length === 0"
          class="text-center text-gray-500 py-4"
        >
          No deliveries found.
        </div>

        <div v-else class="overflow-x-auto border rounded-lg shadow-sm">
          <table class="min-w-full text-sm border-collapse">
            <thead class="bg-gray-50 text-gray-700 border-b">
              <tr>
                <th class="px-4 py-2 text-left font-semibold">Order ID</th>
                <th class="px-4 py-2 text-left font-semibold">Customer Name</th>
                <th class="px-4 py-2 text-left font-semibold">
                  Delivery Address
                </th>
                <th class="px-4 py-2 text-left font-semibold">Delivery Date</th>
                <th class="px-4 py-2 text-left font-semibold">Total Amount</th>
                <th class="px-4 py-2 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(order, index) in formattedDeliveryHistory"
                :key="index"
                class="border-t hover:bg-gray-50"
              >
                <td class="px-4 py-2">{{ order.order_id || 'N/A' }}</td>
                <td class="px-4 py-2">{{ order.customer_name || 'N/A' }}</td>
                <td class="px-4 py-2">{{ order.delivery_address || 'N/A' }}</td>
                <td class="px-4 py-2">{{ order.delivery_date || 'N/A' }}</td>
                <td class="px-4 py-2">{{ order.total_amount ? `₱${order.total_amount}` : 'N/A' }}</td>
                <td
                  class="px-4 py-2 font-medium"
                  :class="getStatusClass(order.status)"
                >
                  {{ formatStatus(order.status) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  rider: {
    type: Object as () => Record<string, any> | null,
    default: null
  },
  deliveryHistory: {
    type: Array as () => any[],
    default: () => []
  }
})

const emit = defineEmits(["update:modelValue", "toggle-status"])

// Computed properties to handle different data structures
const riderId = computed(() => {
  if (!props.rider) return null
  return props.rider.id || props.rider.user_id || props.rider.rider_id
})

const riderName = computed(() => {
  if (!props.rider) return null
  if (props.rider.name) return props.rider.name
  if (props.rider.first_name && props.rider.last_name) {
    return `${props.rider.first_name} ${props.rider.last_name}`
  }
  return null
})

const contactNo = computed(() => {
  if (!props.rider) return null
  return props.rider.contact_no || props.rider.contact_number || props.rider.phone
})

const riderEmail = computed(() => {
  if (!props.rider) return null
  return props.rider.email
})

const riderStatus = computed(() => {
  if (!props.rider) return null
  const status = props.rider.status || props.rider.account_status
  if (typeof status === 'string') {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }
  return status
})

// Format delivery history data - UPDATED to include total_price
const formattedDeliveryHistory = computed(() => {
  if (!props.deliveryHistory || !Array.isArray(props.deliveryHistory)) {
    return []
  }
  
  return props.deliveryHistory.map(order => ({
    order_id: order.order_id || order.id || 'N/A',
    customer_name: order.customer_name || order.customer?.name || 'N/A',
    delivery_address: order.delivery_address || order.address || order.shipping_address || 'N/A',
    delivery_date: formatDate(order.delivery_date || order.created_at || order.order_date || order.date),
    total_amount: order.total_price || order.total_amount || order.amount || order.price || 0,
    status: order.status || 'Unknown'
  }))
})

// Format status text
const formatStatus = (status: string) => {
  if (!status) return 'Unknown'
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
}

// Get status class for styling
const getStatusClass = (status: string) => {
  const statusLower = status?.toLowerCase()
  switch (statusLower) {
    case 'completed':
    case 'delivered':
      return 'text-green-600'
    case 'pending':
    case 'processing':
      return 'text-yellow-600'
    case 'cancelled':
    case 'canceled':
    case 'failed':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

// Format date
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return dateString
  }
}

// Toggle status function
const toggleStatus = () => {
  if (riderId.value) {
    const riderToUpdate = {
      id: riderId.value,
      name: riderName.value,
      contact_no: contactNo.value,
      email: riderEmail.value,
      status: riderStatus.value
    }
    emit('toggle-status', riderToUpdate)
  }
}

// Debug: log the delivery history data
watch(() => props.deliveryHistory, (newHistory) => {
  console.log("🔍 Delivery History Data:", newHistory)
  if (newHistory && newHistory.length > 0) {
    console.log("🔍 First order details:", newHistory[0])
    console.log("🔍 Available fields:", Object.keys(newHistory[0]))
  }
}, { immediate: true })
</script>