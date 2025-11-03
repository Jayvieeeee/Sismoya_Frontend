<script setup lang="ts">
import { CheckIcon, XMarkIcon } from '@heroicons/vue/24/outline';

interface OrderDetails {
  orderId: string;
  status: 'Pending' | 'To Pick Up' | 'Preparing' | 'To Deliver' | 'Completed';
  pickUpDateTime: string;
  gallonType: string;
  quantity: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  deliveredAt?: string;
  imageUrl?: string;
}

defineProps<{
  order: OrderDetails;
  isOpen: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const statusList = ['Pending', 'To Pick Up', 'Preparing', 'To Deliver', 'Completed'];

const statusMap: Record<string, string> = {
  'pending': 'Pending',
  'to_pickup': 'To Pick Up',
  'to_pick_up': 'To Pick Up',
  'preparing': 'Preparing',
  'to_deliver': 'To Deliver',
  'completed': 'Completed'
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
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
    @click.self="emit('close')"
  >
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-xl relative">
      <!-- Close Button -->
      <button
        @click="emit('close')"
        class="absolute top-6 right-6 text-gray-500 hover:text-gray-700 transition"
        aria-label="Close"
      >
        <XMarkIcon class="w-6 h-6" />
      </button>

      <!-- Title -->
      <h2 class="text-2xl font-bold text-center text-primary pt-8 pb-6">Order Details</h2>

      <div class="px-12 pb-12">
        <!-- Two Column Layout -->
        <div class="flex gap-16">
          
          <!-- Status Tracker --> 
          <div class="relative flex flex-col space-y-4">
            <!-- Background Line -->
            <div class="absolute left-[10px] top-[20px] bottom-[90px] w-0.5 bg-gray-300"></div>
            
            <!-- Filled Green Progress Line -->
            <div
              class="absolute left-[10px] top-[20px] w-0.5 bg-green-500 transition-all duration-500"
              :style="{ bottom: getProgressLineBottom(order.status) }"
            ></div>

            <div
              v-for="status in statusList"
              :key="status"
              class="relative flex items-center gap-4"
            >
              <!-- Status Checkmark Circle -->
              <div
                :class="[ 
                  'w-6 h-6 rounded-full flex items-center justify-center relative z-10 flex-shrink-0 border-2',
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

              <!-- Status Label -->
              <span
                :class="[
                  'font-semibold whitespace-nowrap',
                  isActiveStatus(status, order.status)
                    ? 'text-gray-900'
                    : 'text-gray-400'
                ]"
              >
                {{ status }}
              </span>
            </div>
          </div>

          <!-- Order Details -->
          <div class="flex-1 space-y-3 pt-2">
            <div>
              <p class="font-medium text-gray-900">Order ID: {{ order.orderId }}</p>
            </div>
            
            <div>
              <p class="font-medium text-gray-900">Pick Up DateTime:</p>
              <p class="text-gray-700">{{ order.pickUpDateTime }}</p>
            </div>
            
            <div class="flex items-start gap-4">
              <div class="flex-1">
                <p class="font-medium text-gray-900 mb-1">Gallon :</p>
                <p class="text-gray-700">{{ order.gallonType }} {{ order.quantity }}x</p>
                <p class="text-gray-700">Slim Gallon 1x</p>
              </div>
            </div>
            
            <div>
              <p class="font-medium text-gray-900">Total Amount: ₱{{ order.totalAmount.toFixed(2) }}</p>
            </div>
            
            <div>
              <p class="font-medium text-gray-900">Payment Method: {{ order.paymentMethod }}</p>
            </div>
                        <div>
              <p class="font-medium text-gray-900">Payment Status: {{ order.paymentStatus }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>