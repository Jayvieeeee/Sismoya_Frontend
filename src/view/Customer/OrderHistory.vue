<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import axiosInstance from "@/utils/axios"
import CustomerLayout from "@/Layout/CustomerLayout.vue"

const orders = ref<any[]>([])
const loading = ref(true)
const search = ref("")

function formatDate(dateString: string) {
  const d = new Date(dateString)
  return d.toLocaleString("en-PH", {
    dateStyle: "short",
    timeStyle: "short"
  })
}

onMounted(async () => {
  try {
    const res = await axiosInstance.get("/orders/user")
    if (res.data.success) {
      orders.value = res.data.orders
    }
  } catch (err) {
    console.error("Failed to load orders:", err)
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

      <div class="mb-4">
        <input
          v-model="search"
          type="text"
          placeholder="Search"
          class="w-full sm:w-1/3 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            <!-- Empty -->
            <tr v-else-if="filteredOrders.length === 0">
              <td colspan="6" class="text-center py-6 text-gray-500">No orders found.</td>
            </tr>

            <!-- Data -->
            <tr
              v-else
              v-for="order in filteredOrders"
              :key="order.order_id"
              class="border-t hover:bg-gray-50"
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


