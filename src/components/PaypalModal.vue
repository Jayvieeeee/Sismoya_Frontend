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
        <span class="text-gray-800 font-semibold text-lg">₱{{ parseFloat(amount).toFixed(2) }}</span>
      </div>

      <!-- Error -->
      <p v-if="errorMessage" class="text-red-500 text-sm mb-4 text-center">
        {{ errorMessage }}
      </p>

      <!-- Loading State -->
      <div v-if="isRedirecting" class="flex flex-col items-center gap-2 mb-6">
        <div class="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-sm text-gray-600">Redirecting to PayPal...</p>
      </div>

      <!-- Instructions -->
      <div v-else class="mb-6 rounded-lg">
        <p class="text-xs">
          You will be redirected to PayPal's checkout page.
        </p>
      </div>

      <!-- Pay Button -->
      <button
        v-if="!isRedirecting"
        @click="handlePay"
        :disabled="isLoading"
        class="w-full bg-primary hover:bg-secondary disabled:bg-gray-400 text-white font-semibold py-3 rounded-full transition-colors mb-3"
      >
        {{ isLoading ? 'Processing...' : 'Proceed to PayPal' }}
      </button>

      <button
        v-if="!isRedirecting"
        @click="closeModal"
        class="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 rounded-full transition-colors"
      >
        Cancel
      </button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import paypalImg from '@/assets/images/paypal.png'
import axiosInstance from '@/utils/axios'

export default {
  name: 'PayPalPaymentModal',
  props: {
    amount: {
      type: [String, Number],
      required: true
    },
    isOpen: {
      type: Boolean,
      required: true
    },
    orderId: {
      type: [String, Number],
      default: null
    }
  },
  emits: ['payment-success', 'payment-error', 'closed'],
  
  setup(props, { emit }) {
    const isLoading = ref(false)
    const isRedirecting = ref(false)
    const errorMessage = ref(null)

    const handlePay = async () => {
      if (!props.amount || !props.orderId) {
        errorMessage.value = 'Missing order information'
        return
      }

      isLoading.value = true
      errorMessage.value = null

      try {
        
        const res = await axiosInstance.post(`/orders/paypal/create`, {
          order_id: props.orderId,
          amount: parseFloat(props.amount).toFixed(2)
        })

        const data = res.data

        if (data.success && data.paypal?.approve_link) {
          
          // Show redirecting state
          isRedirecting.value = true
          
          // Use setTimeout to allow the UI to update before redirect
          setTimeout(() => {
            // Use full page redirect - this is the key fix
            window.location.href = data.paypal.approve_link
          }, 1000)
          
        } else {
          errorMessage.value = data.message || 'Failed to initiate PayPal payment.'
          emit('payment-error', errorMessage.value)
        }
      } catch (err) {
        errorMessage.value = err.response?.data?.message || err.message || 'PayPal payment failed. Please try again.'
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

    return {
      paypalImg,
      isLoading,
      isRedirecting,
      errorMessage,
      handlePay,
      closeModal
    }
  }
}
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>