<script setup lang="ts">
import { CheckIcon, XMarkIcon } from '@heroicons/vue/24/outline';

interface Order {
  id: number
  order_id: string
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

// Status tracking
const statusList = ['Pending', 'To Pick Up', 'Preparing', 'To Deliver', 'Completed'];

const statusMap: Record<string, string> = {
  'pending': 'Pending',
  'to_pickup': 'To Pick Up',
  'to_pick_up': 'To Pick Up',
  'picked_up': 'To Pick Up', // Map picked_up to To Pick Up for consistency
  'picked up': 'To Pick Up', // Map picked up to To Pick Up for consistency
  'preparing': 'Preparing',
  'to_deliver': 'To Deliver',
  'delivered': 'Completed',
  'completed': 'Completed',
  'cancelled': 'Cancelled'
};

function getDisplayStatus(backendStatus: string): string {
  return statusMap[backendStatus.toLowerCase()] || 'Pending';
}

function isActiveStatus(status: string, orderStatus: string) {
  const displayOrderStatus = getDisplayStatus(orderStatus);
  const statusIndex = statusList.indexOf(status);
  const orderStatusIndex = statusList.indexOf(displayOrderStatus);
  return statusIndex <= orderStatusIndex;
}

function getProgressLineBottom(orderStatus: string) {
  const displayOrderStatus = getDisplayStatus(orderStatus);
  const currentIndex = statusList.indexOf(displayOrderStatus);
  
  if (currentIndex === -1) return '100%';
  
  const progressPercentage = (currentIndex / (statusList.length - 1)) * 100;
  
  return `${100 - progressPercentage}%`;
}

function isCancelled(orderStatus: string): boolean {
  return getDisplayStatus(orderStatus) === 'Cancelled';
}

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

const getPaymentStatusDisplay = (status: string | undefined): string => {
  if (!status) return 'Pending';
  
  const statusMap: { [key: string]: string } = {
    'paid': 'Paid',
    'unpaid': 'Unpaid',
    'pending': 'Pending',
    'failed': 'Failed',
    'refunded': 'Refunded'
  };
  
  return statusMap[status.toLowerCase()] || 'Pending';
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
    @click.self="closeModal"
  >
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative overflow-hidden">
      <!-- Close Button -->
      <button
        @click="closeModal"
        class="absolute top-6 right-6 text-gray-500 hover:text-gray-700 transition z-10"
        aria-label="Close"
      >
        <XMarkIcon class="w-6 h-6" />
      </button>

      <!-- Title -->
      <h2 class="text-2xl font-bold text-center text-primary pt-8 pb-6">Order Details</h2>

      <div class="pb-8">
        <!-- Two Column Layout -->
        <div class="flex justify-center">
          <!-- Left Column - Status Tracker -->
          <div class="flex-1 max-w-[200px]" v-if="selectedOrder">
            <div class="relative flex flex-col space-y-4">
              <!-- Background Line - Only show if NOT cancelled -->
              <div 
                v-if="!isCancelled(selectedOrder.status)"
                class="absolute left-[10px] top-[20px] bottom-[90px] w-0.5 bg-gray-300"
              ></div>
              
              <!-- Filled Green Progress Line -->
              <div
                v-if="!isCancelled(selectedOrder.status)"
                class="absolute left-[10px] top-[20px] w-0.5 bg-green-500 transition-all duration-500"
                :style="{ bottom: getProgressLineBottom(selectedOrder.status) }"
              ></div>

              <!-- Normal Status Progress -->
              <template v-if="!isCancelled(selectedOrder.status)">
                <div
                  v-for="status in statusList"
                  :key="status"
                  class="relative flex items-center gap-4"
                >
                  <!-- Status Checkmark Circle -->
                  <div
                    :class="[ 
                      'w-6 h-6 rounded-full flex items-center justify-center relative z-10 flex-shrink-0 border-2',
                      isActiveStatus(status, selectedOrder.status) 
                        ? 'bg-green-500 border-green-500' 
                        : 'bg-white border-gray-300'
                    ]"
                  >
                    <CheckIcon
                      v-if="isActiveStatus(status, selectedOrder.status)"
                      class="w-3 h-3 text-white stroke-[3]"
                    />
                  </div>

                  <!-- Status Label -->
                  <span
                    :class="[
                      'font-semibold whitespace-nowrap text-sm',
                      isActiveStatus(status, selectedOrder.status)
                        ? 'text-gray-900'
                        : 'text-gray-400'
                    ]"
                  >
                    {{ status }}
                  </span>
                </div>
              </template>

              <!-- Cancelled Status - Simple Circle with X -->
              <template v-else>
                <div class="relative flex items-center gap-4">
                  <!-- Circle with X -->
                  <div class="w-6 h-6 rounded-full flex items-center justify-center relative z-10 flex-shrink-0 border-2 bg-red-500 border-red-500">
                    <XMarkIcon class="w-3 h-3 text-white stroke-[3]" />
                  </div>
                  <!-- Cancel Text -->
                  <span class="font-semibold whitespace-nowrap text-red-600 text-sm">
                    Cancelled
                  </span>
                </div>
              </template>
            </div>
          </div>

          <!-- Right Column - Order Details -->
          <div class="flex-1 space-y-4 max-w-xs" v-if="selectedOrder">
            <!-- Order ID -->
            <div>
              <p class="text-sm font-medium text-gray-900">Order ID: {{ selectedOrder.order_id || selectedOrder.id }}</p>
            </div>

            <!-- Customer Name -->
            <div>
              <p class="text-sm font-medium text-gray-900">Customer Name: {{ getCustomerName(selectedOrder) }}</p>
            </div>

            <!-- Contact No -->
            <div>
              <p class="text-sm font-medium text-gray-900">Contact No: {{ selectedOrder.contact_no }}</p>
            </div>

            <!-- Address -->
            <div>
              <p class="text-sm font-medium text-gray-900">Address: {{ selectedOrder.address }}</p>
            </div>

            <!-- Pick Up DateTime -->
            <div>
              <p class="text-sm font-medium text-gray-900">Pick Up Date & Time: {{ formatDate(selectedOrder.pickup_datetime) }}</p>
            </div>

            <!-- Products -->
            <div>
              <p class="text-sm font-medium text-gray-900">Products: {{ selectedOrder.products }}</p>
            </div>

            <!-- Total Amount -->
            <div>
              <p class="text-sm font-medium text-gray-900">Total Amount: {{ formatPrice(selectedOrder.total_price) }}</p>
            </div>

            <!-- Payment Status -->
           <div>
            <p class="text-sm font-medium text-gray-900">Payment Status: {{ getPaymentStatusDisplay(selectedOrder.payment_status) }}</p>
          </div>

            <!-- Payment Method --> 
            <div>
              <p class="text-sm font-medium text-gray-900">Payment Method: {{ ( selectedOrder.payment_method) }}</p>
            </div>

            <!-- Special Instructions -->
            <div v-if="selectedOrder.special_instructions">
              <p class="text-sm font-medium text-gray-900">Special Instructions:</p>
              <p class="text-sm text-gray-700">{{ selectedOrder.special_instructions }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>