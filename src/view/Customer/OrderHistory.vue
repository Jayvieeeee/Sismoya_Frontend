<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import axiosInstance from "@/utils/axios"
import CustomerLayout from "@/Layout/CustomerLayout.vue"
import { useRouter } from "vue-router"
import { getProfile } from "@/utils/auth"

const router = useRouter()
const orders = ref<any[]>([])
const loading = ref(true)
const search = ref("")
const backendError = ref("")

function formatDate(dateString: string) {
  const d = new Date(dateString)
  return d.toLocaleString("en-PH", {
    dateStyle: "short",
    timeStyle: "short"
  })
}

onMounted(async () => {
  try {
    const token = localStorage.getItem("token")
    console.log("🔐 Current token:", token)

    if (!token) {
      router.push("/login")
      return
    }

    // Test if token is valid using profile
    try {
      const profile = await getProfile()
      console.log("✅ Token is valid, profile:", profile)
    } catch (profileError) {
      console.error("❌ Token validation failed:", profileError)
      // Only logout if profile fails (authentication issue)
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      router.push("/login")
      return
    }

    // Try to fetch orders
    console.log("🔄 Fetching orders from /orders endpoint...")
    const res = await axiosInstance.get("/orders")
    console.log("✅ Orders response:", res.data)
    
    if (res.data.success) {
      orders.value = res.data.orders
      console.log(`📦 Loaded ${orders.value.length} orders`)
    }
  } catch (err: any) {
    console.error("❌ Failed to load orders:", err)
    console.error("Error details:", err.response?.data)
    
    if (err.response?.status === 401) {
      console.error("🔒 401 Unauthorized - Backend middleware issue")
      backendError.value = "Order history is temporarily unavailable due to a backend configuration issue."
      // DON'T logout here - this is a backend issue, not an authentication failure
    } else {
      backendError.value = "Failed to load orders. Please try again later."
    }
  } finally {
    loading.value = false
  }
})

const filteredOrders = computed(() => {
  return orders.value.filter((o) => {
    return (
      search.value === "" ||
      o.order_id.toString().includes(search.value) ||
      "Round Gallon".toLowerCase().includes(search.value.toLowerCase())
    )
  })
})
</script>

<template>
  <CustomerLayout>
    <div class="max-w-6xl mx-auto p-6">
      <h1 class="text-2xl sm:text-3xl font-bold mb-6 text-blue-800">Orders</h1>

      <!-- Show backend issue warning -->
      <div v-if="backendError" class="mb-4 p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
        <p class="text-yellow-800 text-sm">
          {{ backendError }}
        </p>
      </div>

      <div class="mb-4">
        <input
          v-model="search"
          type="text"
          placeholder="Search"
          class="w-full sm:w-1/3 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          :disabled="!!backendError"
        />
      </div>

      <!-- 📋 Orders Table -->
      <div class="bg-white shadow-md rounded-xl overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-center border-b">
              <th class="py-3 px-4 font-semibold">Order ID</th>
              <th class="py-3 px-4 font-semibold">Order</th>
              <th class="py-3 px-4 font-semibold">Total Amount</th>
              <th class="py-3 px-4 font-semibold">Date</th>
              <th class="py-3 px-4 font-semibold">Status</th>
              <th class="py-3 px-4 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            <!-- Loading -->
            <tr v-if="loading">
              <td colspan="6" class="text-center py-6">Loading orders...</td>
            </tr>

            <!-- Backend Error Message -->
            <tr v-else-if="backendError && orders.length === 0">
              <td colspan="6" class="text-center py-8">
                <div class="flex flex-col items-center text-gray-500">
                  <svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                  </svg>
                  <p class="font-medium">Order History Temporarily Unavailable</p>
                  <p class="text-sm mt-1">We're working to resolve this issue.</p>
                </div>
              </td>
            </tr>

            <!-- Empty State (no backend error) -->
            <tr v-else-if="orders.length === 0">
              <td colspan="6" class="text-center py-6 text-gray-500">No orders found.</td>
            </tr>

            <!-- Data -->
            <tr
              v-else
              v-for="order in filteredOrders"
              :key="order.order_id"
              class="border-t hover:bg-gray-50 text-center"
            >
              <td class="py-3 px-4">{{ order.order_id }}</td>
              <td class="py-3 px-4">Round Gallon</td>
              <td class="py-3 px-4">₱{{ order.total_price.toFixed(2) }}</td>
              <td class="py-3 px-4">{{ formatDate(order.created_at) }}</td>
              <td
                class="py-3 px-4 font-medium"
                :class="{
                  'text-yellow-500': order.status === 'Pending',
                  'text-green-600': order.status === 'Completed',
                  'text-red-600': order.status === 'Cancelled',
                  'text-blue-600': order.status === 'To Pick Up' || order.status === 'To Deliver'
                }"
              >
                {{ order.status }}
              </td>
              <td class="py-3 px-4">
                <button class="text-blue-600 underline hover:text-blue-800">
                  View Details
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </CustomerLayout>
</template>