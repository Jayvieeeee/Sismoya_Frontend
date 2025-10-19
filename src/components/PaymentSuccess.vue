<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
      <!-- Success Icon -->
      <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
      
      <!-- Success Message -->
      <h1 class="text-2xl font-bold text-gray-800 mb-4">Payment Successful!</h1>
      <p class="text-gray-600 mb-2">Thank you for your payment.</p>
      <p class="text-gray-600 mb-6">Your order has been placed successfully.</p>
      
      <!-- Order Details -->
      <div class="bg-gray-50 rounded-lg p-4 mb-6 text-left">
        <p class="text-sm text-gray-600 mb-1"><strong>Order ID:</strong> {{ order_id }}</p>
        <p class="text-sm text-gray-600 mb-1"><strong>Amount:</strong> ₱{{ amount }}</p>
        <p class="text-sm text-gray-600 mb-1"><strong>PayPal Token:</strong> {{ token }}</p>
        <p class="text-sm text-gray-600"><strong>Payer ID:</strong> {{ payer_id }}</p>
      </div>

      <!-- Debug Info -->
      <div class="bg-yellow-50 rounded-lg p-3 mb-4 text-left">
        <p class="text-xs text-yellow-800">
          <strong>Debug Info:</strong> Page loaded successfully. Check console for details.
        </p>
      </div>

      <!-- Actions -->
      <div class="space-y-3">
        <button 
          @click="viewOrders"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-full transition-colors"
        >
          View My Orders
        </button>
        <button 
          @click="goHome"
          class="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 rounded-full transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axiosInstance from '@/utils/axios'

export default {
  name: 'PaymentSuccess',
  setup() {
    const router = useRouter()
    const order_id = ref(null)
    const amount = ref(null)
    const token = ref(null)
    const payer_id = ref(null)

    onMounted(() => {
      // Get parameters from URL
      const urlParams = new URLSearchParams(window.location.search)
      order_id.value = urlParams.get('order_id')
      amount.value = urlParams.get('amount')
      token.value = urlParams.get('token')
      payer_id.value = urlParams.get('Payer_id')

        console.log('PaymentSuccess page loaded');
        console.log(window.location.href);
        document.body.style.backgroundColor = 'red'; // quick visibility check
      console.log('PaymentSuccess mounted with params:', {
        order_id: order_id.value,
        amount: amount.value,
        token: token.value,
        payer_id: payer_id.value
      })

      // Call backend to capture payment
      if (token.value && payerId.value) {
        capturePayment()
      }
    })

    const capturePayment = async () => {
      try {
        console.log('Confirming payment...')
        const response = await axiosInstance.get('/orders/paypal/confirm', {
          token: token.value,
          payer_id: payer_id.value,
          order_id: order_id.value
        })
        console.log('Payment confirmation result:', response.data)
      } catch (error) {
        console.error('Error confirming payment:', error)
      }
    }

    const viewOrders = () => {
      router.push('/orderHistory')
    }

    const goHome = () => {
      router.push('/')
    }

    return {
      order_id,
      amount,
      token,
      payer_id,
      viewOrders,
      goHome
    }
  }
}
</script>