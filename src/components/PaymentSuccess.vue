<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <!-- Loading State -->
    <div v-if="loading" class="text-center">
      <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p class="text-gray-600">Processing your payment...</p>
    </div>

    <!-- Success State -->
    <div v-else class="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
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
    const loading = ref(false)

    onMounted(async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const urlToken = urlParams.get('token')
      const urlPayerId = urlParams.get('PayerID')
      
      console.log('PaymentSuccess page loaded')
      console.log('Full URL:', window.location.href)
      console.log('URL params:', { token: urlToken, PayerID: urlPayerId })
      
      // Check if coming from PayPal (has token but no orderId yet)
      if (urlToken && urlPayerId && !urlParams.get('orderId')) {
        loading.value = true
        
        try {
          console.log('Confirming payment with backend...')
          
          // Call backend confirm endpoint
          const response = await axiosInstance.get('/orders/paypal/confirm', {
            params: { 
              token: urlToken, 
              PayerID: urlPayerId 
            }
          })
          
          console.log('Backend response:', response.data)
          
          if (response.data.success) {
            // Set values from backend response
            order_id.value = response.data.data.order_id
            amount.value = response.data.data.amount
            token.value = response.data.data.token
            payer_id.value = response.data.data.payer_id
            
            console.log('Payment confirmed successfully:', {
              order_id: order_id.value,
              amount: amount.value,
              token: token.value,
              payer_id: payer_id.value
            })
          } else {
            console.error('Payment failed:', response.data.message)
            router.push({
              path: '/payment-cancel',
              query: { error: response.data.message }
            })
          }
          
        } catch (error) {
          console.error('Error confirming payment:', error)
          router.push({
            path: '/payment-cancel',
            query: { error: error.message || 'Payment confirmation failed' }
          })
        } finally {
          loading.value = false
        }
        
      } else {
        // Already has orderId (direct access or reload)
        order_id.value = urlParams.get('orderId')
        amount.value = urlParams.get('amount')
        token.value = urlToken
        payer_id.value = urlPayerId
        
        console.log('Direct access with params:', {
          order_id: order_id.value,
          amount: amount.value,
          token: token.value,
          payer_id: payer_id.value
        })
      }
    })

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
      loading,
      viewOrders,
      goHome
    }
  }
}
</script>