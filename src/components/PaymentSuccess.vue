<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <!-- Loading State -->
    <div v-if="loading" class="text-center">
      <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p class="text-gray-600 text-lg font-semibold">Confirming your payment...</p>
      <p class="text-xs text-gray-500 mt-2">Please wait while we verify with PayPal</p>
    </div>

    <!-- Success State -->
    <div v-else-if="success" class="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
      <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
      
      <h1 class="text-2xl font-bold text-gray-800 mb-4">Payment Successful! 🎉</h1>
      <p class="text-gray-600 mb-2">Thank you for your payment.</p>
      <p class="text-gray-600 mb-6">Your order #{{ order_id }} has been confirmed.</p>
      
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

    <!-- Error State with Detailed Info -->
    <div v-else class="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
      <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg class="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </div>
      
      <h1 class="text-2xl font-bold text-gray-800 mb-4">Payment Confirmation Issue</h1>
      <p class="text-gray-600 mb-4">{{ errorMessage }}</p>
      
      <!-- Detailed Debug Info -->
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left mb-6">
        <h3 class="font-semibold text-yellow-800 mb-2">Debug Information:</h3>
        <div class="text-xs text-yellow-700 space-y-1">
          <p><strong>Token:</strong> {{ token || 'Not provided' }}</p>
          <p><strong>Payer ID:</strong> {{ payer_id || 'Not provided' }}</p>
          <p><strong>Error Type:</strong> {{ errorDetails?.error_type || 'Unknown' }}</p>
          <p><strong>Location:</strong> {{ errorDetails?.debug?.file }}:{{ errorDetails?.debug?.line }}</p>
          
          <!-- FIXED: Replace <p> with <div> to avoid HTML validation error -->
          <div v-if="backendResponse" class="mt-2">
            <strong>Backend Response:</strong><br>
            <pre class="whitespace-pre-wrap mt-1">{{ JSON.stringify(backendResponse, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <p class="text-sm text-gray-500 mb-6">
        Don't worry - your payment with PayPal was successful. 
        This is just a confirmation issue. Please contact support if the amount was deducted.
      </p>

      <div class="space-y-3">
        <button 
          @click="retryConfirmation"
          class="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 rounded-full transition-colors"
        >
          Retry Confirmation
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

export default {
  name: 'PaymentSuccess',
  setup() {
    const router = useRouter()
    const loading = ref(true)
    const success = ref(false)
    const token = ref(null)
    const payer_id = ref(null)
    const order_id = ref(null)
    const errorMessage = ref(null)
    const errorDetails = ref(null)
    const backendResponse = ref(null)

    const confirmPayment = async () => {
      loading.value = true
      errorMessage.value = null
      errorDetails.value = null
      backendResponse.value = null

      try {
        console.log('🔄 Confirming payment with backend...')
        
        const url = `https://sismoya.bsit3b.site/api/orders/paypal/confirm?token=${encodeURIComponent(token.value)}&PayerID=${encodeURIComponent(payer_id.value)}`
        console.log('URL:', url)
        
        const response = await fetch(url)
        const data = await response.json()
        
        backendResponse.value = data
        console.log('📋 Backend response:', data)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        if (data.success) {
          success.value = true
          order_id.value = data.data.order_id
          console.log('✅ Payment confirmed successfully!')
        } else {
          errorMessage.value = data.message || 'Payment confirmation failed'
          errorDetails.value = data
          console.error('❌ Backend returned error:', data)
        }

      } catch (error) {
        console.error('❌ Confirmation failed:', error)
        errorMessage.value = 'Unable to confirm payment with server'
        errorDetails.value = backendResponse.value || { error_type: 'Network Error', message: error.message }
      } finally {
        loading.value = false
      }
    }

    const retryConfirmation = () => {
      confirmPayment()
    }

    onMounted(async () => {
      const urlParams = new URLSearchParams(window.location.search)
      token.value = urlParams.get('token')
      payer_id.value = urlParams.get('PayerID')

      console.log('🔍 PaymentSuccess mounted with:', {
        token: token.value,
        payer_id: payer_id.value
      })

      if (token.value && payer_id.value) {
        await confirmPayment()
      } else {
        loading.value = false
        errorMessage.value = 'Invalid payment link - missing required parameters'
      }
    })

    const viewOrders = () => {
      router.push('/orderHistory')
    }

    const goHome = () => {
      router.push('/')
    }

    return {
      loading,
      success,
      token,
      payer_id,
      order_id,
      errorMessage,
      errorDetails,
      backendResponse,
      retryConfirmation,
      viewOrders,
      goHome
    }
  }
}
</script>