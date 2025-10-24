<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import axiosInstance from "@/utils/axios"
import CustomerLayout from "@/Layout/CustomerLayout.vue"
import OrderDetailsModal from "@/components/OrderDetailsModal.vue"
import { useRouter } from "vue-router"
import { getProfile } from "@/utils/auth"

const router = useRouter()
const orders = ref<any[]>([])
const loading = ref(true)
const search = ref("")
const backendError = ref("")

// Modal state
const isModalOpen = ref(false)
const selectedOrder = ref<any>(null)

function formatDate(dateString: string) {
  const d = new Date(dateString)
  return d.toLocaleString("en-PH", {
    dateStyle: "short",
    timeStyle: "short"
  })
}

// Get product name from order items - UPDATED with correct property paths
function getProductName(order: any) {
  if (order.items && order.items.length > 0) {
    const firstItem = order.items[0]
    // Use gallon_name from the item
    return firstItem.gallon_name || "Water Gallon"
  }
  
  return "Water Gallon"
}


// Get all items for modal display
function getAllItems(order: any) {
  if (order.items && order.items.length > 0) {
    return order.items.map((item: any) => ({
      name: item.gallon_name || "Water Gallon",
      quantity: item.quantity || 1,
      price: item.price || 0,
      imageUrl: item.image_url || undefined
    }))
  }
  return []
}

// Open modal with order details - UPDATED
function viewOrderDetails(order: any) {
  selectedOrder.value = {
    orderId: order.order_id.toString(),
    status: order.status,
    pickUpDateTime: formatDate(order.pickup_datetime || order.created_at),
    items: getAllItems(order), // Pass all items for display
    totalAmount: order.total_price,
    paymentMethod: order.payment_method || "Cash",
    paymentStatus: order.payment_status || "unknown"
  }
  isModalOpen.value = true
}

// Close modal
function closeModal() {
  isModalOpen.value = false
  selectedOrder.value = null
}

onMounted(async () => {
  try {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    try {
      await getProfile()
    } catch {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      router.push("/login")
      return
    }

    const res = await axiosInstance.get("/orders")
    
    if (res.data.success) {
      orders.value = res.data.orders
    }
  } catch (err: any) {
    console.error("Failed to load orders:", err)
    if (err.response?.status === 401) {
      backendError.value = "Order history is temporarily unavailable due to a backend configuration issue."
    } else {
      backendError.value = "Failed to load orders. Please try again later."
    }
  } finally {
    loading.value = false
  }
})

const filteredOrders = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return orders.value

  return orders.value.filter((o) => {
    const orderId = o.order_id?.toString().toLowerCase() || ""
    const status = o.status?.toLowerCase() || ""
    const total = o.total_price?.toString().toLowerCase() || ""
    const date = formatDate(o.created_at).toLowerCase()
    const productName = getProductName(o).toLowerCase() // Use dynamic product name for search
    const payment = o.payment_method?.toLowerCase() || ""

    return (
      orderId.includes(query) ||
      status.includes(query) ||
      total.includes(query) ||
      date.includes(query) ||
      productName.includes(query) ||
      payment.includes(query)
    )
  })
})
</script>

<template>
  <CustomerLayout>
    <div class="p-4 sm:p-6 max-w-6xl mx-auto w-full">
      <h1 class="text-2xl sm:text-3xl font-bold mb-6 text-primary">Orders</h1>

      <!-- Backend Error -->
      <div
        v-if="backendError"
        class="mb-4 p-4 bg-yellow-100 border border-yellow-400 rounded-lg"
      >
        <p class="text-yellow-800 text-sm">
          {{ backendError }}
        </p>
      </div>

      <!-- Search Bar -->
      <div class="mb-4">
        <input
          v-model="search"
          type="text"
          placeholder="Search orders..."
          class="w-full sm:w-1/3 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          :disabled="!!backendError"
        />
      </div>

      <!-- Desktop Table with Scrollable Body Inside -->
      <div class="hidden sm:block bg-white shadow-md rounded-xl overflow-hidden">
        <div class="max-h-[calc(100vh-220px)] overflow-y-auto">
          <table class="w-full text-sm">
            <thead class="sticky top-0 bg-gray-50 z-10">
              <tr class="text-center border-b">
                <th class="py-3 px-4 font-semibold">Order ID</th>
                <th class="py-3 px-4 font-semibold">Product</th>
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

              <!-- Backend Error -->
              <tr v-else-if="backendError && orders.length === 0">
                <td colspan="6" class="text-center py-8">
                  <div class="flex flex-col items-center text-gray-500">
                    <svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                    </svg>
                    <p class="font-medium">Order History Temporarily Unavailable</p>
                    <p class="text-sm mt-1">We're working to resolve this issue.</p>
                  </div>
                </td>
              </tr>

              <!-- Empty -->
              <tr v-else-if="orders.length === 0">
                <td colspan="6" class="text-center py-6 text-gray-500">No orders found.</td>
              </tr>

              <!-- Data Rows -->
              <tr
                v-else
                v-for="order in filteredOrders"
                :key="order.order_id"
                class="border-t hover:bg-gray-50 text-center"
              >
                <td class="py-3 px-4">{{ order.order_id }}</td>
                <td class="py-3 px-4">{{ getProductName(order) }}</td> <!-- Now shows actual product name -->
                <td class="py-3 px-4">₱{{ order.total_price?.toFixed(2) }}</td>
                <td class="py-3 px-4">{{ formatDate(order.created_at) }}</td>
                <td
                  class="py-3 px-4 font-medium"
                  :class="{
                    'text-yellow-500': order.status === 'pending',
                    'text-green-600': order.status === 'completed',
                    'text-red-600': order.status === 'cancelled',
                    'text-blue-600': order.status === 'to_pick_up' || order.status === 'to_deliver'
                  }"
                >
                  {{ order.status?.charAt(0).toUpperCase() + order.status?.slice(1) }}
                </td>
                <td class="py-3 px-4">
                  <button 
                    @click="viewOrderDetails(order)"
                    class="text-blue-600 underline hover:text-blue-800"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Mobile View (Cards) -->
      <div class="sm:hidden space-y-4">
        <div v-if="loading" class="text-center py-6 text-gray-500">Loading orders...</div>

        <div v-else-if="backendError && orders.length === 0" class="text-center py-8 text-gray-500">
          <p class="font-medium">Order History Temporarily Unavailable</p>
          <p class="text-sm mt-1">We're working to resolve this issue.</p>
        </div>

        <div v-else-if="orders.length === 0" class="text-center py-6 text-gray-500">
          No orders found.
        </div>

        <div
          v-else
          v-for="order in filteredOrders"
          :key="order.order_id"
          class="bg-white shadow rounded-lg p-4 border border-gray-100"
        >
          <div class="flex justify-between items-center mb-2">
            <h2 class="font-semibold text-blue-800">Order #{{ order.order_id }}</h2>
            <span
              class="text-sm font-medium"
              :class="{
                'text-yellow-500': order.status === 'pending',
                'text-green-600': order.status === 'completed',
                'text-red-600': order.status === 'cancelled',
                'text-blue-600': order.status === 'to_pick_up' || order.status === 'to_deliver'
              }"
            >
              {{ order.status?.charAt(0).toUpperCase() + order.status?.slice(1) }}
            </span>
          </div>

          <p class="text-gray-700"><strong>Product:</strong> {{ getProductName(order) }}</p> <!-- Now shows actual product name -->
          <p class="text-gray-700"><strong>Total:</strong> ₱{{ order.total_price?.toFixed(2) }}</p>
          <p class="text-gray-700"><strong>Date:</strong> {{ formatDate(order.created_at) }}</p>
          <p class="text-gray-700"><strong>Payment:</strong> {{ order.payment_method?.charAt(0).toUpperCase() + order.payment_method?.slice(1) }}</p>

          <div class="mt-3 text-right">
            <button 
              @click="viewOrderDetails(order)"
              class="text-blue-600 underline hover:text-blue-800 text-sm"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Details Modal -->
    <OrderDetailsModal
      v-if="selectedOrder"
      :order="selectedOrder"
      :isOpen="isModalOpen"
      @close="closeModal"
    />
  </CustomerLayout>
</template>