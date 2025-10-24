<script setup lang="ts">
import { ref } from 'vue'
import AdminLayout from '@/Layout/AdminLayout.vue'

interface Order {
  id: number
  name: string
  date: string
  status: 'Completed' | 'Pending' | 'Cancelled'
  amount: number
}

const currentDate = ref('September 15, 2025')
const currentTime = ref('11:00 AM')

const stats = ref([
  { label: 'Completed Orders Today', value: 100 },
  { label: 'Total Sales Today', value: '₱1000' },
  { label: 'Pending Orders', value: 25 },
  { label: 'Total Customers', value: 35 }
])

const ordersToPickUp = ref(12)
const ordersToDeliver = ref(21)

const salesData = ref([
  { month: 'Jan', value: 220 },
  { month: 'Feb', value: 260 },
  { month: 'Mar', value: 300 },
  { month: 'Apr', value: 280 },
  { month: 'May', value: 360 },
  { month: 'Jun', value: 240 }
])

const orderStatusData = ref([
  { label: 'Pending', value: 50, color: 'text-orange-500' },
  { label: 'Preparing', value: 20, color: 'text-blue-500' },
  { label: 'Completed', value: 90, color: 'text-green-500' }
])

const recentOrders = ref<Order[]>([
  {
    id: 1,
    name: 'Jayda Letada',
    date: 'September 09, 2025',
    status: 'Completed',
    amount: 90.00
  },
  {
    id: 2,
    name: 'Chrisha Dalmacio',
    date: 'April 23, 2025',
    status: 'Pending',
    amount: 120.00
  },
  {
    id: 3,
    name: 'Evejay Campo',
    date: 'January 01, 2025',
    status: 'Cancelled',
    amount: 120.00
  },
  {
    id: 4,
    name: 'Evejay Campo',
    date: 'January 01, 2025',
    status: 'Cancelled',
    amount: 120.00
  }
])

const maxSales = Math.max(...salesData.value.map(d => d.value))

const getStatusColor = (status: Order['status']) => {
  const colors = {
    'Completed': 'text-green-500',
    'Pending': 'text-orange-500',
    'Cancelled': 'text-red-500'
  }
  return colors[status]
}
</script>

<template>
  <AdminLayout>
    <div class="h-screen flex flex-col p-4">
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Header -->
        <div class="flex justify-between items-center mb-4">
          <h1 class="text-3xl font-bold text-primary">Dashboard</h1>
          <div class="flex gap-4 text-sm">
            <div class="bg-white px-4 py-2 rounded-lg shadow-sm">{{ currentDate }}</div>
            <div class="bg-white px-4 py-2 rounded-lg shadow-sm">{{ currentTime }}</div>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-4 gap-4 mb-4">
          <div v-for="stat in stats" :key="stat.label" 
               class="bg-white rounded-xl p-4 shadow-sm">
            <div class="text-3xl font-bold text-primary mb-1">{{ stat.value }}</div>
            <div class="text-gray-600 text-xs">{{ stat.label }}</div>
          </div>
        </div>

        <!-- Charts and Orders Section -->
        <div class="flex-1 grid grid-cols-3 gap-4 overflow-hidden">
          <!-- Sales Revenue Chart -->
          <div class="col-span-2 bg-white rounded-xl p-4 shadow-sm flex flex-col">
            <div class="flex justify-between items-center mb-4">
              <h2 class="font-semibold text-gray-700">Sales Revenue</h2>
              <div class="flex gap-2">
                <button class="px-3 py-1 text-xs rounded-full bg-blue-500 text-white">Daily</button>
                <button class="px-3 py-1 text-xs rounded-full bg-gray-200 text-gray-600">Weekly</button>
                <button class="px-3 py-1 text-xs rounded-full bg-gray-200 text-gray-600">Monthly</button>
              </div>
            </div>
            <div class="flex-1 flex items-end justify-around gap-2 pb-4">
              <div v-for="data in salesData" :key="data.month" 
                   class="flex-1 flex flex-col items-center">
                <div class="w-full bg-gray-300 rounded-t-lg relative"
                     :style="{ height: `${(data.value / maxSales) * 200}px` }">
                </div>
                <span class="text-xs text-gray-600 mt-2">{{ data.month }}</span>
              </div>
            </div>
          </div>

          <!-- Order Status Pie Chart -->
          <div class="bg-white rounded-xl p-4 shadow-sm flex flex-col">
            <h2 class="font-semibold text-gray-700 mb-4">Order Status</h2>
            <div class="flex-1 flex items-center justify-center">
              <div class="relative w-40 h-40">
                <!-- Simple pie chart representation -->
                <svg viewBox="0 0 100 100" class="transform -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" stroke-width="20" 
                          stroke-dasharray="226 226" stroke-dashoffset="0" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f97316" stroke-width="20" 
                          stroke-dasharray="113 226" stroke-dashoffset="-113" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" stroke-width="20" 
                          stroke-dasharray="45 226" stroke-dashoffset="-158" />
                </svg>
              </div>
            </div>
            <div class="space-y-2">
              <div v-for="status in orderStatusData" :key="status.label" 
                   class="flex items-center justify-between text-sm">
                <div class="flex items-center gap-2">
                  <div :class="status.color">●</div>
                  <span class="text-gray-600">{{ status.label }}</span>
                </div>
                <span class="font-semibold">{{ status.value }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Section -->
        <div class="grid grid-cols-3 gap-4 my-4">
          <!-- Orders To Pick Up & Deliver -->
          <div class="space-y-4">
            <!-- Orders To Pick Up -->
            <div class="bg-white rounded-xl p-4 shadow-sm">
              <h3 class="font-semibold text-gray-700 mb-3 text-sm">Orders To Pick Up</h3>
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <span class="text-3xl font-bold text-gray-800">{{ ordersToPickUp }}</span>
              </div>
            </div>

            <!-- Orders To Deliver -->
            <div class="bg-white rounded-xl p-4 shadow-sm">
              <h3 class="font-semibold text-gray-700 mb-3 text-sm">Orders To Deliver</h3>
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span class="text-3xl font-bold text-gray-800">{{ ordersToDeliver }}</span>
              </div>
            </div>
          </div>

          <!-- Recent Orders -->
          <div class="col-span-2 bg-white rounded-xl p-4 shadow-sm">
            <h3 class="font-semibold text-gray-700 mb-3 text-sm">Recent Orders</h3>
            <div class="space-y-2 overflow-auto" style="max-height: 160px;">
              <div v-for="order in recentOrders" :key="order.id" 
                   class="flex justify-between items-center text-xs py-2 border-b border-gray-100 last:border-0">
                <div class="w-12">
                  <div class="font-medium text-gray-800">{{ order.id }}</div>
                </div>
                <div class="flex-1">
                  <div class="text-gray-600">{{ order.name }}</div>
                </div>
                <div class="flex-1">
                  <div class="text-gray-500">{{ order.date }}</div>
                </div>
                <div class="w-24">
                  <div :class="getStatusColor(order.status)" class="font-medium">{{ order.status }}</div>
                </div>
                <div class="w-20 text-right">
                  <div class="text-gray-800 font-medium">{{ order.amount.toFixed(2) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>