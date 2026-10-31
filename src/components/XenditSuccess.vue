<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import axiosInstance from "../utils/axios"

const route = useRoute()
const router = useRouter()
const status = ref<"checking" | "paid" | "pending" | "expired" | "error">("checking")

const orderId = route.query.order_id as string
const paymentRef = route.query.ref as string

const checkStatus = async (attempt = 1) => {
  try {
    const res = await axiosInstance.get(`/payments/xendit/status/${orderId}`, {
      params: { ref: paymentRef }
    })
    if (!res.data.success) {
      status.value = "error"
      return
    }
    status.value = res.data.data.status
    // The payment can take a moment to register, so retry a few times
    if (status.value === "pending" && attempt < 5) {
      setTimeout(() => checkStatus(attempt + 1), 3000)
    }
  } catch {
    status.value = "error"
  }
}

onMounted(() => {
  if (!orderId || !paymentRef) {
    status.value = "error"
    return
  }
  checkStatus()
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 font-montserrat">
    <div class="bg-white rounded-2xl shadow-lg px-10 py-8 max-w-md w-full text-center">
      <p v-if="status === 'checking'" class="text-gray-700">Checking your payment...</p>
      <template v-else-if="status === 'paid'">
        <p class="text-xl font-semibold text-primary">Payment received</p>
        <p class="mt-2 text-sm text-gray-600">Your order {{ orderId }} has been placed.</p>
      </template>
      <p v-else-if="status === 'pending'" class="text-gray-700">
        Your payment is still processing. Check your order history in a moment.
      </p>
      <p v-else-if="status === 'expired'" class="text-gray-700">
        This payment link expired. Please place the order again.
      </p>
      <p v-else class="text-gray-700">
        We couldn't confirm your payment. Check your order history.
      </p>

      <button
        class="mt-6 bg-primary text-white px-6 py-2 rounded-full hover:bg-secondary transition-colors font-medium"
        @click="router.push('/orderHistory')"
      >
        View my orders
      </button>
    </div>
  </div>
</template>