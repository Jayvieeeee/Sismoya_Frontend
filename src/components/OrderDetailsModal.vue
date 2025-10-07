<script setup lang="ts">
interface OrderDetails {
  orderId: string;
  status: 'Pending' | 'To Pick Up' | 'Preparing' | 'To Deliver' | 'Completed';
  pickUpDateTime: string;
  gallonType: string;
  quantity: number;
  totalAmount: number;
  paymentMethod: string;
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

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    'Pending': 'bg-green-500',
    'To Pick Up': 'bg-yellow-500',
    'Preparing': 'bg-blue-500',
    'To Deliver': 'bg-purple-500',
    'Completed': 'bg-gray-500'
  };
  return colors[status] || 'bg-gray-300';
}

function isActiveStatus(status: string, orderStatus: string) {
  const statusIndex = statusList.indexOf(status);
  const orderStatusIndex = statusList.indexOf(orderStatus);
  return statusIndex <= orderStatusIndex;
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
    @click.self="emit('close')"
  >
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative overflow-hidden">
      <!-- Close Button -->
      <button
        @click="emit('close')"
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
          <!-- Left Column - Status Timeline -->
          <div class="flex-shrink-0">
            <div class="space-y-3">
              <!-- Status Items -->
              <div
                v-for="(status, index) in statusList"
                :key="status"
                class="flex items-center gap-3"
              >
                <!-- Status Dot -->
                <div
                  :class="[
                    'w-3 h-3 rounded-full flex-shrink-0',
                    isActiveStatus(status, order.status) ? getStatusColor(status) : 'bg-gray-300'
                  ]"
                ></div>
                
                <!-- Status Label -->
                <span
                  :class="[
                    'text-xs',
                    isActiveStatus(status, order.status) ? 'font-medium text-gray-800' : 'text-gray-500'
                  ]"
                >
                  {{ status }}
                </span>
              </div>
            </div>
          </div>

          <!-- Right Column - Order Details -->
          <div class="flex-1 space-y-4 max-w-xs">
            <!-- Order ID -->
            <div>
              <p class="text-sm">Order ID: {{ order.orderId }}</p>
            </div>

            <!-- Pick Up DateTime -->
            <div>
              <p class="text-sm">Pick Up DateTime: {{ order.pickUpDateTime }}</p>
            </div>

            <!-- Gallon with Icon -->
            <div class="flex items-center gap-2">
              <div class="text-sm">Gallon:</div>
              <div class="flex items-center gap-1">
                <span class="text-sm">{{ order.gallonType }} {{ order.quantity }}x</span>
              </div>
            </div>

            <!-- Total Amount -->
            <div>
              <p class="text-sm">Total Amount: {{ order.totalAmount.toFixed(2) }}</p>
            </div>

            <!-- Payment Method -->
            <div>
              <p class="text-sm">Payment Method: {{ order.paymentMethod }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 