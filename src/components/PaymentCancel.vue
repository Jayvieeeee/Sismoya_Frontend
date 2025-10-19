<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
      <!-- Cancel Icon -->
      <div class="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg class="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
        </svg>
      </div>
      
      <!-- Cancel Message -->
      <h1 class="text-2xl font-bold text-gray-800 mb-4">Payment Cancelled</h1>
      <p class="text-gray-600 mb-6">Your payment was cancelled. You can try again anytime.</p>

      <!-- Actions -->
      <div class="space-y-3">
        <button 
          @click="goToCart"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-full transition-colors"
        >
          Return to Cart
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
export default {
  name: 'PaymentCancel',
  methods: {
    goToCart() {
      window.location.href = '/cart'
    },
    goHome() {
      window.location.href = '/'
    }
  }
}
</script>