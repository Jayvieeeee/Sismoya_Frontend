<script setup lang="ts">
import { CheckIcon, XMarkIcon } from '@heroicons/vue/24/outline'

interface ProductItem {
  name: string
  quantity: number
  price: number
  total_price: number
}

interface OrderDetails {
  orderId: string
  status: string
  pickUpDateTime: string
  products: ProductItem[]
  totalAmount: number
  paymentMethod: string
  paymentStatus: string
  deliveredAt?: string
  addressLabel?: string
  fullAddress?: string
}

defineProps<{
  order: OrderDetails
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

// UPDATED: Added "Picked Up" status
const statusList = ['Pending', 'To Pick Up', 'Picked Up', 'Preparing', 'To Deliver', 'Completed']

// UPDATED: Enhanced status mapping
const statusMap: Record<string, string> = {
  pending: 'Pending',
  to_pickup: 'To Pick Up',
  picked_up: 'Picked Up', // Added Picked Up status
  to_pick_up: 'To Pick Up',
  preparing: 'Preparing',
  to_deliver: 'To Deliver',
  delivered: 'Completed',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

function getDisplayStatus(backendStatus: string): string {
  return statusMap[backendStatus?.toLowerCase()] || 'Pending'
}

// UPDATED: Improved active status logic with new statuses
function isActiveStatus(status: string, orderStatus: string) {
  const displayOrderStatus = getDisplayStatus(orderStatus)
  
  // For cancelled orders, nothing is active
  if (displayOrderStatus === 'Cancelled') {
    return false
  }
  
  // For completed/delivered orders, all steps are active
  if (displayOrderStatus === 'Completed') {
    return true
  }
  
  return statusList.indexOf(status) <= statusList.indexOf(displayOrderStatus)
}

function isCancelled(orderStatus: string): boolean {
  return getDisplayStatus(orderStatus) === 'Cancelled'
}

// UPDATED: Improved progress height calculation with new statuses
function getProgressHeight(orderStatus: string) {
  if (isCancelled(orderStatus)) return "0%"
  
  const displayStatus = getDisplayStatus(orderStatus)
  const currentIndex = statusList.indexOf(displayStatus)
  
  if (currentIndex < 0) return "0%"
  
  // If completed, show full height
  if (displayStatus === 'Completed') return "100%"
  
  return `${(currentIndex / (statusList.length - 1)) * 100}%`
}

// NEW: Get status color for better visual feedback
function getStatusColor(status: string) {
  const normalized = status?.toLowerCase()
  switch (normalized) {
    case 'pending': return 'text-yellow-500'
    case 'to_pickup': return 'text-blue-600'
    case 'picked_up': return 'text-green-500'
    case 'preparing': return 'text-blue-600'
    case 'to_deliver': return 'text-blue-600'
    case 'delivered': return 'text-green-600'
    case 'completed': return 'text-green-600'
    case 'cancelled': return 'text-red-600'
    default: return 'text-gray-500'
  }
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
    @click.self="emit('close')"
  >
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-xl relative">

      <button
        @click="emit('close')"
        class="absolute top-6 right-6 text-gray-500 hover:text-gray-700 transition"
      >
        <XMarkIcon class="w-6 h-6" />
      </button>

      <h2 class="text-2xl font-bold text-center text-primary pt-8 pb-6">
        Order Details
      </h2>

      <div class="px-12 pb-12">
        <div class="flex gap-16">

          <!-- ✅ UPDATED PROGRESS TRACK WITH PICKED UP STATUS -->
          <div class="relative flex flex-col justify-between h-[300px]"> <!-- Increased height for extra step -->

            <!-- Background Line -->
            <div
              v-if="!isCancelled(order.status)"
              class="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-300"
            ></div>

            <!-- Progress Line -->
            <div
              v-if="!isCancelled(order.status)"
              class="absolute left-3 w-0.5 bg-green-500 transition-all duration-500"
              :style="{ height: getProgressHeight(order.status) }"
            ></div>

            <!-- Normal Steps -->
            <template v-if="!isCancelled(order.status)">
              <div
                v-for="status in statusList"
                :key="status"
                class="relative flex items-center gap-4"
              >
                <div
                  :class="[
                    'w-6 h-6 rounded-full flex items-center justify-center border-2',
                    isActiveStatus(status, order.status)
                      ? 'bg-green-500 border-green-500'
                      : 'bg-white border-gray-300'
                  ]"
                >
                  <CheckIcon
                    v-if="isActiveStatus(status, order.status)"
                    class="w-3 h-3 text-white"
                  />
                </div>
                <span
                  :class="[
                    'font-semibold',
                    isActiveStatus(status, order.status) ? 'text-gray-900' : 'text-gray-400'
                  ]"
                >
                  {{ status }}
                </span>
              </div>
            </template>

            <!-- Cancelled -->
            <template v-else>
              <div class="relative flex items-center gap-4">
                <div class="w-6 h-6 rounded-full bg-red-500 border-red-500 flex items-center justify-center">
                  <XMarkIcon class="w-3 h-3 text-white" />
                </div>
                <span class="font-semibold text-red-600">Cancelled</span>
              </div>
            </template>
          </div>

          <!-- ✅ ORDER DETAILS -->
          <div class="flex-1 space-y-3 pt-2">
            <p><span class="font-medium text-gray-900">Order ID:</span> {{ order.orderId }}</p>
            <p><span class="font-medium text-gray-900">Pick Up DateTime:</span> {{ order.pickUpDateTime }}</p>

            <p class="font-medium text-gray-900">Products:</p>
            <div v-for="(product, index) in order.products" :key="index">
              <p class="text-gray-600 text-sm">{{ product.name }} <span>x{{ product.quantity }}</span></p>
            </div>

            <p class="font-medium text-gray-900">Total Amount: ₱{{ order.totalAmount.toFixed(2) }}</p>
            <p class="font-medium text-gray-900">Payment Method: {{ order.paymentMethod }}</p>
            <p class="font-medium text-gray-900">Payment Status: {{ order.paymentStatus }}</p>
          
          </div>

        </div>
      </div>
    </div>
  </div>
</template>