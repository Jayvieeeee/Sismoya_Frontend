<script setup lang="ts">
interface Order {
  id: number
  order_id: number
  customer_name: string
  customerName?: string
  products: string
  product?: string
  total_price: number
  totalAmount?: number
  pickup_datetime: string
  created_at: string
  status:
    | 'pending'
    | 'to_pickup'
    | 'to_pick_up'
    | 'picked_up'
    | 'picked up'
    | 'preparing'
    | 'to_deliver'
    | 'delivered'
    | 'cancelled'
  payment_method?: string
  payment_status?: string
  contact_no?: string
  address?: string
  special_instructions?: string
}

interface Props {
  isOpen: boolean
  selectedOrder: Order | null
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Helper functions
const getCustomerName = (order: Order) => {
  return order.customer_name || order.customerName || "Customer"
}

const formatPrice = (price: any): string => {
  const numPrice = Number(price) || 0
  return `₱${numPrice.toFixed(2)}`
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  
  if (dateString.match(/\d{2}-\d{2}-\d{4} \d{1,2}:\d{2}[AP]M/)) {
    return dateString
  }
  
  try {
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return 'Invalid Date'
    
    return d.toLocaleString("en-PH", {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  } catch {
    return dateString || 'N/A'
  }
}

const getDisplayStatus = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    'pending': 'Pending',
    'to_pickup': 'To Pick-Up',
    'to_pick_up': 'To Pick-Up',
    'picked_up': 'Picked Up',
    'picked up': 'Picked Up',
    'preparing': 'Preparing',
    'to_deliver': 'To Deliver',
    'completed': 'Completed',
    'cancelled': 'Cancelled'
  }
  return statusMap[status] || status
}

const getStatusColor = (status: string) => {
  const colors: { [key: string]: string } = {
    'pending': 'bg-orange-100 text-orange-800',
    'to_pickup': 'bg-blue-100 text-blue-800',
    'to_pick_up': 'bg-blue-100 text-blue-800',
    'picked_up': 'bg-gray-100 text-gray-800',
    'picked up': 'bg-gray-100 text-gray-800',
    'preparing': 'bg-purple-100 text-purple-800',
    'to_deliver': 'bg-indigo-100 text-indigo-800',
    'completed': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

const closeModal = () => {
  emit('close')
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
    @click.self="closeModal"
  >
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative overflow-hidden">
      <!-- Close Button -->
      <button
        @click="closeModal"
        class="absolute top-4 right-4 text-gray-600 hover:text-gray-800 transition text-xl font-bold z-10"
        aria-label="Close"
      >
        ✕
      </button>

      <!-- Title -->
      <h2 class="text-2xl font-semibold text-center text-primary py-6">Order Details</h2>

      <div class="p-6 pb-12">
        <!-- Two Column Layout - Centered with larger gap -->
        <div class="flex justify-center items-center gap-12">
          <!-- Right Column - Order Details -->
          <div class="flex-1 space-y-4 max-w-xs" v-if="selectedOrder">
            <!-- Order ID -->
            <div>
              <p class="text-sm">Order ID: {{ selectedOrder.order_id || selectedOrder.id }}</p>
            </div>

            <!-- Customer Name -->
            <div>
              <p class="text-sm">Customer Name: {{ getCustomerName(selectedOrder) }}</p>
            </div>

            <!-- Contact No -->
            <div>
              <p class="text-sm">Contact No: {{ selectedOrder.contact_no || 'N/A' }}</p>
            </div>

            <!-- Address -->
            <div>
              <p class="text-sm">Address: {{ selectedOrder.address || 'N/A' }}</p>
            </div>

            <!-- Pick Up DateTime -->
            <div>
              <p class="text-sm">Pick Up Date & Time: {{ formatDate(selectedOrder.pickup_datetime) }}</p>
            </div>

            <!-- Total Amount -->
            <div>
              <p class="text-sm">Total Amount: {{ formatPrice(selectedOrder.total_price || selectedOrder.totalAmount) }}</p>
            </div>

            <!-- Payment Method -->
            <div>
              <p class="text-sm">Payment Method: {{ (selectedOrder.payment_status === 'paid' ? 'Paid' : 'Unpaid') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>