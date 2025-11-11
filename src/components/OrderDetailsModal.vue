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
  deliveredAt: string
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
const statusList = ['Pending', 'To Pick Up', 'Picked Up', 'Preparing', 'To Deliver', 'Delivered']

// UPDATED: Enhanced status mapping
const statusMap: Record<string, string> = {
  pending: 'Pending',
  to_pickup: 'To Pick Up',
  picked_up: 'Picked Up',
  to_pick_up: 'To Pick Up',
  preparing: 'Preparing',
  to_deliver: 'To Deliver',
  delivered: 'Delivered',
  completed: 'Delivered',
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

// UPDATED: Improved progress height calculation to match admin modal
function getProgressLineBottom(orderStatus: string) {
  if (isCancelled(orderStatus)) return '100%'
  
  const displayStatus = getDisplayStatus(orderStatus)
  const currentIndex = statusList.indexOf(displayStatus)
  
  if (currentIndex === -1) return '100%'
  
  // Calculate progress but stop before the last status
  const maxIndex = statusList.length - 1
  const progressPercentage = (currentIndex / maxIndex) * 100
  
  // Add a small offset to prevent going over the last circle
  const offset = 5 // percentage offset from bottom
  return `${Math.max(offset, 100 - progressPercentage)}%`
}

// NEW: Format date time for better display
function formatDateTime(dateTimeString: string): string {
  if (!dateTimeString) return 'N/A'
  
  try {
    const date = new Date(dateTimeString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return dateTimeString
  }
}

// NEW: Format payment status display
function getPaymentStatusDisplay(status: string | undefined): string {
  if (!status) return 'Pending'
  
  const statusMap: { [key: string]: string } = {
    'paid': 'Paid',
    'unpaid': 'Unpaid',
    'pending': 'Pending',
    'failed': 'Failed',
    'refunded': 'Refunded'
  }
  
  return statusMap[status.toLowerCase()] || 'Pending'
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-2"
    @click.self="emit('close')"
  >
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-xl relative overflow-hidden">
      <!-- Close Button -->
      <button
        @click="emit('close')"
        class="absolute top-6 right-6 text-gray-500 hover:text-gray-700 transition z-10"
      >
        <XMarkIcon class="w-6 h-6" />
      </button>

      <!-- Title -->
      <h2 class="text-2xl font-bold text-center text-primary pt-8 pb-6">
        Order Details
      </h2>

      <div class="pb-6">
        <!-- Two Column Layout - Matching admin modal structure -->
        <div class="flex justify-center">
          <!-- Left Column - Status Tracker (Compact like admin) -->
          <div class="flex-1 max-w-[200px] flex items-start">
            <div class="relative flex flex-col justify-between min-h-[300px] w-full">
              <!-- Background Line - stops before last circle -->
              <div
                v-if="!isCancelled(order.status)"
                class="absolute left-[10px] top-[30px] bottom-[30px] w-0.5 bg-gray-300"
              ></div>

              <!-- Progress Line - stops before going over last circle -->
              <div
                v-if="!isCancelled(order.status)"
                class="absolute left-[10px] top-[30px] w-0.5 bg-green-500 transition-all duration-500"
                :style="{ bottom: getProgressLineBottom(order.status) }"
              ></div>

              <!-- Normal Steps -->
              <template v-if="!isCancelled(order.status)">
                <div
                  v-for="status in statusList"
                  :key="status"
                  class="relative flex items-center gap-4 flex-1"
                >
                  <div
                    :class="[
                      'w-6 h-6 rounded-full flex items-center justify-center border-2 z-10 flex-shrink-0',
                      isActiveStatus(status, order.status)
                        ? 'bg-green-500 border-green-500'
                        : 'bg-white border-gray-300'
                    ]"
                  >
                    <CheckIcon
                      v-if="isActiveStatus(status, order.status)"
                      class="w-3 h-3 text-white stroke-[3]"
                    />
                  </div>
                  <span
                    :class="[
                      'font-semibold text-sm whitespace-nowrap',
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
                  <div class="w-6 h-6 rounded-full bg-red-500 border-red-500 flex items-center justify-center border-2 z-10 flex-shrink-0">
                    <XMarkIcon class="w-3 h-3 text-white stroke-[3]" />
                  </div>
                  <span class="font-semibold text-red-600 text-sm whitespace-nowrap">Cancelled</span>
                </div>
              </template>
            </div>
          </div>

          <!-- Right Column - Order Details (Compact like admin) -->
          <div class="flex-1 space-y-3.5 max-w-xs pt-2">
            <p><span class="font-medium text-gray-900 text-sm">Order ID:</span> {{ order.orderId }}</p>
            <p><span class="font-medium text-gray-900 text-sm">Pick Up DateTime:</span> {{ formatDateTime(order.pickUpDateTime) }}</p>

            <!-- Products List -->
            <div>
              <p class="font-medium text-gray-900 text-sm mb-1">Products:</p>
              <div v-for="(product, index) in order.products" :key="index" class="text-gray-600 text-sm">
                • {{ product.name }} <span>x{{ product.quantity }}</span>
              </div>
            </div>

            <p class="font-medium text-gray-900 text-sm">Total Amount: ₱{{ order.totalAmount.toFixed(2) }}</p>
            <p class="font-medium text-gray-900 text-sm">Payment Method: {{ order.paymentMethod }}</p>
            <p class="font-medium text-gray-900 text-sm">Payment Status: {{ getPaymentStatusDisplay(order.paymentStatus) }}</p>
            
            <!-- Delivered At -->
            <p v-if="order.deliveredAt && order.deliveredAt.trim() !== ''" class="font-medium text-gray-900 text-sm">
              Delivered At: {{ formatDateTime(order.deliveredAt) }}
            </p>
            <p v-else class="font-medium text-gray-400 text-sm">
              Delivered At: Not yet delivered
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>