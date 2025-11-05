<script setup lang="ts">
interface Order {
  order_id: number
  status: string
  total_price: number | string
  payment_method: string
  pickup_datetime: string
  products: string 
}

interface Customer {
  name: string
  contact_no: string
  address: string
}

interface Props {
  isOpen: boolean
  selectedOrder: Order | null
  customerInfo?: Customer | null
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formatPrice = (price: any): string => {
  const num = Number(price) || 0
  return `₱${num.toFixed(2)}`
}

const closeModal = () => emit('close')
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
      >
        ✕
      </button>

      <!-- Title -->
      <h2 class="text-2xl font-semibold text-center text-primary py-6">Order Details</h2>

      <div class="p-6 space-y-4 text-sm">
        <template v-if="selectedOrder">
          <p><span class="font-semibold">Order ID:</span> {{ selectedOrder.order_id }}</p>

          <p>
            <span class="font-semibold">Customer Name:</span>
            {{ customerInfo?.name || "N/A" }}
          </p>

          <p>
            <span class="font-semibold">Contact No:</span>
            {{ customerInfo?.contact_no || "N/A" }}
          </p>

          <p>
            <span class="font-semibold">Address:</span>
            {{ customerInfo?.address || "N/A" }}
          </p>

          <p>
            <span class="font-semibold">Gallon Type: </span>
            {{ selectedOrder.products || "N/A" }}
          </p>

          <p>
            <span class="font-semibold">Pick Up Date & Time:</span>
            {{ selectedOrder.pickup_datetime || "N/A" }}
          </p>

          <p>
            <span class="font-semibold">Total Amount:</span>
            {{ formatPrice(selectedOrder.total_price) }}
          </p>

          <p>
            <span class="font-semibold">Payment Method:</span>
            {{ selectedOrder.payment_method }}
          </p>

          <p>
            <span class="font-semibold">Status:</span>
            <span class="capitalize">{{ selectedOrder.status }}</span>
          </p>
        </template>

        <template v-else>
          <p class="text-center text-gray-500 italic">No order details available.</p>
        </template>
      </div>
    </div>
  </div>
</template>
