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
}

defineProps<{
  order: OrderDetails
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const statusList = ['Pending', 'To Pick Up', 'Preparing', 'To Deliver', 'Completed']

const statusMap: Record<string, string> = {
  pending: 'Pending',
  to_pickup: 'To Pick Up',
  to_pick_up: 'To Pick Up',
  preparing: 'Preparing',
  to_deliver: 'To Deliver',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

function getDisplayStatus(backendStatus: string): string {
  return statusMap[backendStatus?.toLowerCase()] || 'Pending'
}

function isActiveStatus(status: string, orderStatus: string) {
  return statusList.indexOf(status) <= statusList.indexOf(getDisplayStatus(orderStatus))
}

function isCancelled(orderStatus: string): boolean {
  return getDisplayStatus(orderStatus) === 'Cancelled'
}

function getProgressHeight(orderStatus: string) {
  const displayStatus = getDisplayStatus(orderStatus)
  const currentIndex = statusList.indexOf(displayStatus)
  if (currentIndex < 0) return "0%"
  return `${(currentIndex / (statusList.length - 1)) * 100}%`
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

          <!-- ✅ FIXED PROGRESS TRACK -->
          <div class="relative flex flex-col justify-between h-[260px]">

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
