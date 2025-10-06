<!-- OrderDetailsModal.vue - All on one line -->
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
      <h2 class="text-2xl font-semibold text-center text-primary py-6 border-b">Order Details</h2>

      <div class="p-6">
        <!-- Two Column Layout -->
        <div class="flex gap-4">
          <!-- Left Column - Status Timeline -->
          <div class="flex-1">
            <div class="relative">
              <!-- Vertical Line -->
              <div class="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-300"></div>
              
              <!-- Status Items -->
              <div
                v-for="(status, index) in statusList"
                :key="status"
                class="flex items-center gap-3 mb-6 last:mb-0 relative"
              >
                <!-- Status Dot -->
                <div
                  :class="[
                    'w-4 h-4 rounded-full flex-shrink-0 relative z-10',
                    isActiveStatus(status, order.status) ? getStatusColor(status) : 'bg-gray-300'
                  ]"
                ></div>
                
                <!-- Status Label -->
                <span
                  :class="[
                    'text-sm',
                    isActiveStatus(status, order.status) ? 'font-semibold text-gray-800' : 'text-gray-500'
                  ]"
                >
                  {{ status }}
                </span>
              </div>
            </div>
          </div>

          <!-- Right Column - Order Details (ALL ON ONE LINE) -->
          <div class="flex-1 space-y-4">
            <!-- Order ID - ONE LINE -->
            <div>
              <p class="text-sm text-gray-800">
                <span class="font-semibold">Order ID:</span> {{ order.orderId }}
              </p>
            </div>

            <!-- Pick Up DateTime - ONE LINE -->
            <div>
              <p class="text-sm text-gray-800">
                <span class="font-semibold">Pick Up DateTime:</span> {{ order.pickUpDateTime }}
              </p>
            </div>

            <!-- Gallon - ONE LINE -->
            <div>
              <p class="text-sm text-gray-800">
                <span class="font-semibold">Gallon:</span> {{ order.gallonType }} {{ order.quantity }}x
              </p>
            </div>

            <!-- Total Amount - ONE LINE -->
            <div>
              <p class="text-sm text-gray-800">
                <span class="font-semibold">Total Amount:</span> ₱{{ order.totalAmount.toFixed(2) }}
              </p>
            </div>

            <!-- Payment Method - ONE LINE -->
            <div>
              <p class="text-sm text-gray-800">
                <span class="font-semibold">Payment Method:</span> {{ order.paymentMethod }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>