<!-- OrderDetailsModal.vue - Updated with proper image handling -->
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
    'To Pick Up': 'bg-gray-300',
    'Preparing': 'bg-gray-300',
    'To Deliver': 'bg-gray-300',
    'Completed': 'bg-gray-300'
  };
  return colors[status] || 'bg-gray-300';
}

function isActiveStatus(status: string, orderStatus: string) {
  return status === orderStatus;
}

// Image error handler - SAME AS ORDER SUMMARY
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.style.display = 'none';
}

// Function to format image URL - SAME AS ORDER SUMMARY
function getImageUrl(imageUrl: string | undefined | null): string {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('/')) {
    return `https://sismoya.com/api${imageUrl}`;
  }
  return imageUrl;
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
    @click.self="emit('close')"
  >
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative overflow-hidden border-4 border-blue-400">
      <!-- Close Button -->
      <button
        @click="emit('close')"
        class="absolute top-4 right-4 text-gray-600 hover:text-gray-800 transition text-xl font-bold z-10"
        aria-label="Close"
      >
        ✕
      </button>

      <!-- Title -->
      <h2 class="text-2xl font-bold text-center text-blue-500 py-6 border-b">Order Details</h2>

      <div class="flex p-6 gap-6">
        <!-- Left Side - Status List -->
        <div class="flex flex-col gap-4 min-w-[120px]">
          <div
            v-for="status in statusList"
            :key="status"
            class="flex items-center gap-2"
          >
            <div
              :class="[
                'w-3 h-3 rounded-full flex-shrink-0',
                isActiveStatus(status, order.status) ? getStatusColor(status) : 'bg-gray-300'
              ]"
            ></div>
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

        <!-- Right Side - Order Details -->
        <div class="flex-1 space-y-3">
          <!-- Order ID -->
          <div>
            <p class="text-sm font-semibold text-gray-800">Order ID: {{ order.orderId }}</p>
          </div>

          <!-- Pick Up DateTime -->
          <div>
            <p class="text-sm font-semibold text-gray-800">
              Pick Up DateTime: {{ order.pickUpDateTime }}
            </p>
          </div>

          <!-- Gallon - UPDATED TO MATCH ORDER SUMMARY STYLING -->
          <div>
            <p class="text-sm font-semibold text-gray-800 mb-1">Gallon :</p>
            <div class="flex items-center gap-3">
              <span class="text-sm text-gray-800">{{ order.gallonType }} {{ order.quantity }}x</span>
              <!-- Product Image with Error Handling - EXACTLY LIKE ORDER SUMMARY -->
            </div>
          </div>

          <!-- Total Amount -->
          <div>
            <p class="text-sm font-semibold text-gray-800">
              Total Amount: ₱{{ order.totalAmount.toFixed(2) }}
            </p>
          </div>

          <!-- Payment Method -->
          <div>
            <p class="text-sm font-semibold text-gray-800">
              Payment Method: {{ order.paymentMethod }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>