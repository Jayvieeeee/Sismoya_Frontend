<script setup lang="ts">
import { ref } from 'vue'
import paypalImg from '@/assets/images/paypal.png'
import axiosInstance from '@/utils/axios'

// -------------------- Props --------------------
const props = defineProps<{
  amount: string | number
  isOpen: boolean
  orderId: string | number | null
}>()

const emit = defineEmits(['payment-success', 'payment-error', 'closed'])

// -------------------- State --------------------
const isLoading = ref(false)
const isRedirecting = ref(false)
const errorMessage = ref<string | null>(null)

interface PayPalResponse {
  success: boolean
  paypal?: { approve_link: string }
  message?: string
}

// -------------------- Functions --------------------
const handlePay = async () => {
  if (!props.amount || !props.orderId) return

  isLoading.value = true
  errorMessage.value = null

  try {
    const res = await axiosInstance.post(`/orders/paypal/create`, {
      order_id: props.orderId,
      total_amount: props.amount
    })

    const data: PayPalResponse = res.data

    if (data.success && data.paypal?.approve_link) {
      console.log('Redirecting to PayPal:', data.paypal.approve_link)
      isRedirecting.value = true
      setTimeout(() => {
        window.location.href = data.paypal!.approve_link
      }, 1200)
      emit('payment-success', data)
    } else {
      errorMessage.value = data.message || 'Failed to initiate PayPal payment.'
      console.error('PayPal Error:', errorMessage.value, data)
      emit('payment-error', errorMessage.value)
    }
  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || err.message || 'PayPal payment failed.'
    console.error('PayPal Exception:', err)
    emit('payment-error', errorMessage.value)
  } finally {
    isLoading.value = false
  }
}

const closeModal = () => {
  emit('closed')
  errorMessage.value = null
  isRedirecting.value = false
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
  >
    <div
      class="bg-white rounded-2xl p-10 w-96 shadow-xl relative font-montserrat text-center"
    >
      <!-- Close -->
      <button
        @click="closeModal"
        class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
      >
        ✕
      </button>

      <!-- PayPal Image -->
      <div class="flex justify-center mb-4">
        <div class="rounded-2xl p-6 w-48 h-48 flex items-center justify-center">
          <img
            :src="paypalImg"
            alt="PayPal"
            class="w-40 h-auto object-contain"
          />
        </div>
      </div>

      <!-- Amount -->
      <div class="flex justify-between items-center mb-4 px-2">
        <span class="text-gray-800 font-semibold">Total Amount:</span>
        <span class="text-gray-800 font-semibold text-lg">₱{{ amount }}</span>
      </div>

      <!-- Error -->
      <p v-if="errorMessage" class="text-red-500 text-sm mb-4 text-center">
        {{ errorMessage }}
      </p>

      <!-- Loading / Redirecting -->
      <div v-if="isRedirecting" class="flex flex-col items-center gap-2 mt-4">
        <div class="w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-sm text-gray-600 mt-2">Redirecting to PayPal...</p>
      </div>

      <!-- Pay Button -->
      <button
        v-else
        @click="handlePay"
        :disabled="isLoading"
        class="w-full bg-primary hover:bg-secondary disabled:bg-blue-400 text-white font-semibold py-3 rounded-full transition-colors"
      >
        {{ isLoading ? 'Processing...' : 'Pay with PayPal' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
