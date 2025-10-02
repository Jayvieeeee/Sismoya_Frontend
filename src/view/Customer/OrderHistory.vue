<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import axiosInstance from "@/utils/axios"
import CustomerLayout from "@/Layout/CustomerLayout.vue"

const orders = ref<any[]>([])
const loading = ref(true)
const search = ref("")
const filterStatus = ref("All")

function formatDate(dateString: string) {
  const d = new Date(dateString)
  return d.toLocaleString("en-PH", {
    dateStyle: "short",
    timeStyle: "short"
  })
}

// fetch orders
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

// filter + search
const filteredOrders = computed(() => {
  return orders.value.filter((o) => {
    const matchSearch =
      search.value === "" ||
      o.order_id.toString().includes(search.value) ||
      (o.items?.[0]?.gallon_name || "").toLowerCase().includes(search.value.toLowerCase())

    const matchStatus =
      filterStatus.value === "All" || o.status?.toLowerCase() === filterStatus.value.toLowerCase()

    return matchSearch && matchStatus
  })
})
</script>

<template>
  <CustomerLayout>
    <div class="max-w-6xl mx-auto p-6">
      <h1 class="text-3xl font-bold mb-6 text-blue-800">Orders</h1>

      <!-- Search -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <input
          v-model="search"
          type="text"
          placeholder="Search"
          class="w-full sm:w-1/3 px-4 py-2 border rounded-lg"
        />

        <!-- Filters -->
        <div class="flex flex-wrap gap-2">
          <button
            v-for="status in ['All', 'Pending', 'To Pick Up', 'To Deliver', 'Cancelled', 'Completed']"
            :key="status"
            @click="filterStatus = status"
            class="px-4 py-2 rounded-md text-sm font-medium"
            :class="filterStatus === status
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
          >
            {{ status }}
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white shadow-md rounded-xl overflow-x-auto">
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="bg-gray-100 text-left">
              <th class="py-3 px-4">Order ID</th>
              <th class="py-3 px-4">Order</th>
              <th class="py-3 px-4">Total Amount</th>
              <th class="py-3 px-4">DateTime</th>
              <th class="py-3 px-4">Status</th>
              <th class="py-3 px-4">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="text-center py-6">Loading orders...</td>
            </tr>
            <tr v-else-if="filteredOrders.length === 0">
              <td colspan="6" class="text-center py-6 text-gray-500">No orders found.</td>
            </tr>
            <tr
              v-else
              v-for="order in filteredOrders"
              :key="order.order_id"
              class="border-t hover:bg-gray-50"
            >
              <td class="py-3 px-4">{{ order.order_id }}</td>
              <td class="py-3 px-4">
                {{ order.items?.map(i => i.gallon_name || 'Gallon').join(', ') }}
              </td>
              <td class="py-3 px-4">₱{{ order.total_price }}</td>
              <td class="py-3 px-4">{{ formatDate(order.created_at) }}</td>
              <td class="py-3 px-4 font-medium"
                  :class="{
                    'text-yellow-600': order.status === 'Pending',
                    'text-green-600': order.status === 'Completed',
                    'text-red-600': order.status === 'Cancelled',
                    'text-blue-600': order.status === 'To Pick Up' || order.status === 'To Deliver'
                  }">
                {{ order.status }}
              </td>
              <td class="py-3 px-4">
                <a href="#" class="text-blue-600 hover:underline">View Details</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </CustomerLayout>
</template>
