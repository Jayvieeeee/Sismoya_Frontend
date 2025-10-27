<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from "vue"
import axiosInstance from "@/utils/axios"
import AdminLayout from "@/Layout/AdminLayout.vue"
import OrdersToDeliver from "@/assets/icons/orders_to_deliver.png"
import OrdersToPickUp from "@/assets/icons/orders_to_pickup.png"
import ChartDataLabels from "chartjs-plugin-datalabels"

import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  Title,
  ArcElement,
  BarController,
  DoughnutController,
} from "chart.js"

// Register all required components
Chart.register(
  CategoryScale,
  LinearScale,
  BarController,
  DoughnutController,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

interface Order {
  id: number
  name: string
  date: string
  status: "completed" | "pending" | "cancelled" | "preparing" | "to_pickup" | "to_deliver" | string
  amount?: number | null
}

// --- UI state ---
const currentDate = ref(new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }))
const currentTime = ref(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }))

const stats = ref<any[]>([])
const ordersToPickUp = ref(0)
const ordersToDeliver = ref(0)
const recentOrders = ref<Order[]>([])

// sales data arrays prepared from API
const salesDaily = ref<number[]>([])
const salesWeekly = ref<number[]>([])
const salesMonthly = ref<number[]>([])

// pie/order status
const orderStatusMap = ref<Record<string, number>>({})
const orderStatusList = ref<{label: string; value: number; color: string}[]>([])

// chart refs
let barChart: Chart | null = null
let doughnutChart: Chart | null = null
const barCanvas = ref<HTMLCanvasElement | null>(null)
const doughnutCanvas = ref<HTMLCanvasElement | null>(null)

// UI: which view is active
const activeView = ref<"daily" | "weekly" | "monthly">("daily")

// helper: format currency
const formatCurrency = (v: number) => {
  return `₱${Number(v || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

const getDynamicLabels = () => {
  const today = new Date()
  const currentDay = today.getDay() 
  
  const lastMonday = new Date(today)
  const daysSinceMonday = currentDay === 0 ? 6 : currentDay - 1 
  lastMonday.setDate(today.getDate() - daysSinceMonday)
  
  const dailyLabels = []
  for (let i = 0; i < 6; i++) {
    const date = new Date(lastMonday)
    date.setDate(lastMonday.getDate() + i)
    dailyLabels.push(date.toLocaleDateString("en-US", { 
      weekday: "short", 
      month: "short", 
      day: "numeric" 
    }))
  }

  // For weekly view: current week and previous 4 weeks
  const weeklyLabels = []
  for (let i = 4; i >= 0; i--) {
    const weekStart = new Date(lastMonday)
    weekStart.setDate(lastMonday.getDate() - (i * 7))
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 5) // Monday to Saturday (6 days)
    weeklyLabels.push(`W${5-i} (${weekStart.getMonth()+1}/${weekStart.getDate()})`)
  }

  // For monthly view: current year months
  const monthlyLabels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

  return {
    daily: dailyLabels,
    weekly: weeklyLabels,
    monthly: monthlyLabels
  }
}

const labels = ref(getDynamicLabels())

// Update labels every minute to ensure they're current
const updateLabels = () => {
  labels.value = getDynamicLabels()
  if (barChart) {
    renderBarChart()
  }
}

// Render bar chart using Chart.js
function renderBarChart() {
  if (!barCanvas.value) return

  // choose dataset and labels by activeView
  let currentLabels: string[] = []
  let data: number[] = []

  if (activeView.value === "daily") {
    currentLabels = labels.value.daily
    data = salesDaily.value.slice(0, currentLabels.length)
  } else if (activeView.value === "weekly") {
    currentLabels = labels.value.weekly
    data = salesWeekly.value.slice(0, currentLabels.length)
  } else {
    currentLabels = labels.value.monthly
    data = salesMonthly.value.slice(0, currentLabels.length)
  }

  while (data.length < currentLabels.length) data.push(0)

  const ctx = barCanvas.value.getContext("2d")
  if (!ctx) return

  if (barChart) {
    barChart.data.labels = currentLabels
    barChart.data.datasets![0].data = data
    barChart.update()
    return
  }

  barChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: currentLabels,
      datasets: [
        {
          label: "Sales",
          data,
          backgroundColor: "rgba(59,130,246,0.9)",
          borderRadius: 6,
          barThickness: 22,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => formatCurrency(Number(ctx.raw))
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { 
            color: "#6B7280", 
            font: { size: 11 },
            maxRotation: 45,
            minRotation: 45
          }
        },
        y: {
          beginAtZero: true,
          grid: { color: "rgba(0,0,0,0.04)" },
          ticks: {
            callback: (val) => (Number(val) >= 1000 ? `₱${Number(val)/1000}k` : `${Number(val)}`),
            color: "#6B7280"
          }
        }
      }
    }
  })
}

function renderDoughnutChart() {
  if (!doughnutCanvas.value) return;
  const ctx = doughnutCanvas.value.getContext("2d");
  if (!ctx) return;

  const values = orderStatusList.value.map(s => s.value);
  const totalOrders = values.reduce((sum, val) => sum + val, 0);
  
  if (totalOrders === 0) {
    if (doughnutChart) {
      doughnutChart.destroy();
      doughnutChart = null;
    }
    return;
  }

  const nonZeroData = orderStatusList.value.filter(item => item.value > 0);
  const nonZeroLabels = nonZeroData.map(s => s.label);
  const nonZeroValues = nonZeroData.map(s => s.value);
  const nonZeroColors = nonZeroData.map(s => s.color);

  if (doughnutChart) {
    doughnutChart.destroy(); 
  }

  doughnutChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: nonZeroLabels,
      datasets: [
        {
          data: nonZeroValues,
          backgroundColor: nonZeroColors,
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 8,
        }
      ]
    },
    options: {
      cutout: "70%" as any,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (tooltipItem: any) => {
              const value = tooltipItem.raw
              const percentage = totalOrders > 0
                ? Math.round((value / totalOrders) * 100)
                : 0
              return `${tooltipItem.label}: ${value} orders (${percentage}%)`
            }
          }
        }
      }
    } as any
  })
}

function buildOrderStatusList() {
  const map = orderStatusMap.value
  const list = []
  
  if (map["pending"] || map["pending"] === 0) list.push({ label: "Pending", value: map["pending"], color: "#f97316" })
  if (map["preparing"] || map["preparing"] === 0) list.push({ label: "Preparing", value: map["preparing"], color: "#3b82f6" })
  if (map["completed"] || map["completed"] === 0) list.push({ label: "Completed", value: map["completed"], color: "#10b981" })
  if (map["cancelled"] || map["cancelled"] === 0) list.push({ label: "Cancelled", value: map["cancelled"], color: "#ef4444" })
  
  orderStatusList.value = list
}

// Format status for display
const formatStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': 'Pending',
    'preparing': 'Preparing',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'to_pickup': 'To Pickup',
    'to_deliver': 'To Deliver'
  }
  return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1)
}

// Get status color class
const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'pending': 'text-orange-500',
    'preparing': 'text-blue-500',
    'completed': 'text-green-600',
    'cancelled': 'text-red-500',
    'to_pickup': 'text-purple-500',
    'to_deliver': 'text-cyan-500'
  }
  return colors[status] || 'text-gray-500'
}

function extractCustomerName(orderItems: string): string {
  if (!orderItems) return 'Customer'
  
  const productMatch = orderItems.match(/^([^x]+)/)
  if (productMatch) {
    const productName = productMatch[1].trim()
    return `${productName} Customer`
  }
  
  return 'Customer'
}

async function fetchDashboardData() {
  try {
    const token = localStorage.getItem("token")
    const resp = await axiosInstance.get("/dashboard/stats", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    
    if (!resp?.data?.success) {
      console.warn("Dashboard API returned no success flag", resp.data)
      return
    }
    const d = resp.data.data

    console.log("Dashboard data received:", d)

    // Update current date and time
    currentDate.value = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    currentTime.value = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })

    // Stats card values
    stats.value = [
      { label: "Completed Orders Today", value: d.stats?.completed_today ?? 0 },
      { label: "Total Sales Today", value: formatCurrency(d.stats?.total_sales_today ?? 0) },
      { label: "Pending Orders", value: d.stats?.pending_orders ?? 0 },
      { label: "Total Customers", value: d.stats?.total_customers ?? 0 }
    ]

    ordersToPickUp.value = d.orders_to_pickup ?? 0
    ordersToDeliver.value = d.orders_to_deliver ?? 0

    // Process sales data with dynamic labels
    const normalizeArray = (arr: any[], targetLength: number) => {
      const out: number[] = []
      for (let i = 0; i < targetLength; i++) {
        const item = arr[i]
        if (item == null) { out.push(0); continue }
        if (typeof item === "object") {
          out.push(Number(item.total ?? item.value ?? 0))
        } else {
          out.push(Number(item))
        }
      }
      return out
    }

    // Use dynamic label lengths
    salesDaily.value = normalizeArray(d.sales_revenue?.daily ?? [], labels.value.daily.length)
    salesWeekly.value = normalizeArray(d.sales_revenue?.weekly ?? [], labels.value.weekly.length)
    salesMonthly.value = normalizeArray(d.sales_revenue?.monthly ?? [], labels.value.monthly.length)

    // Build order status map
    orderStatusMap.value = {
      pending: d.order_status_distribution?.pending ?? 0,
      preparing: d.order_status_distribution?.preparing ?? 0,
      completed: d.order_status_distribution?.completed ?? 0,
      cancelled: d.order_status_distribution?.cancelled ?? 0,
      to_pickup: d.order_status_distribution?.to_pickup ?? 0,
      to_deliver: d.order_status_distribution?.to_deliver ?? 0
    }
    buildOrderStatusList()

    recentOrders.value = (d.recent_orders ?? []).map((o: any) => {
      const orderItems = o.order_items || ''
      const customerName = extractCustomerName(orderItems) || 'Customer'
      
      return {
        id: o.order_id,
        name: customerName,
        date: new Date(o.created_at).toLocaleDateString("en-US", { 
          month: "short", 
          day: "numeric",
          year: "numeric"
        }),
        status: o.status,
        amount: Number(o.total_price) || 0
      }
    })

    // After data fetched, render charts
    await nextTick()
    renderBarChart()
    renderDoughnutChart()

  } catch (err: any) {
    console.error("fetchDashboardData failed", err.response?.data ?? err.message ?? err)
  }
}

// Auto-refresh data every 30 seconds
const startAutoRefresh = () => {
  setInterval(() => {
    fetchDashboardData()
  }, 30000) // 30 seconds
}

// watch activeView changes to re-render bar chart
watch(activeView, () => {
  renderBarChart()
})

// initial fetch
onMounted(() => {
  fetchDashboardData()
  startAutoRefresh()
  
  // Update labels every minute to keep them current
  setInterval(updateLabels, 60000)
})
</script>

<template>
  <AdminLayout>
    <div class="p-6">
      <!-- Header row -->
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-3xl font-bold text-primary">Dashboard</h1>
        <div class="flex gap-3 items-center">
          <div class="bg-white px-3 py-2 rounded-lg shadow text-sm">{{ currentDate }}</div>
          <div class="bg-white px-3 py-2 rounded-lg shadow text-sm">{{ currentTime }}</div>
        </div>
      </div>

      <!-- Stats cards -->
      <div class="grid grid-cols-4 gap-4 mb-4">
        <div v-for="stat in stats" :key="stat.label" class="bg-white rounded-xl p-4 shadow-sm h-24">
          <div class="text-2xl font-semibold text-primary">{{ stat.value }}</div>
          <div class="text-gray-500 text-xs mt-2">{{ stat.label }}</div>
        </div>
      </div>

      <!-- charts and order status -->
      <div class="grid grid-cols-3 gap-4 mb-2">
        <!-- Sales revenue card -->
        <div class="col-span-2 bg-white rounded-xl p-4 shadow-sm min-h-[260px]">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-semibold text-gray-700">Sales Revenue</h3>

            <!-- toggles -->
            <div class="flex gap-2">
              <button
                :class="{'bg-sky-500 text-white': activeView==='daily', 'bg-gray-200 text-gray-700': activeView!=='daily'}"
                class="px-3 py-1 text-xs rounded-full transition-colors"
                @click="activeView = 'daily'"
              >Daily</button>
              <button
                :class="{'bg-sky-500 text-white': activeView==='weekly', 'bg-gray-200 text-gray-700': activeView!=='weekly'}"
                class="px-3 py-1 text-xs rounded-full transition-colors"
                @click="activeView = 'weekly'"
              >Weekly</button>
              <button
                :class="{'bg-sky-500 text-white': activeView==='monthly', 'bg-gray-200 text-gray-700': activeView!=='monthly'}"
                class="px-3 py-1 text-xs rounded-full transition-colors"
                @click="activeView = 'monthly'"
              >Monthly</button>
            </div>
          </div>

          <!-- chart canvas -->
          <div class="w-full h-44">
            <canvas ref="barCanvas" class="w-full h-full"></canvas>
          </div>
        
        </div>

        <!-- Order status -->
        <div class="bg-white rounded-xl p-4 shadow-sm min-h-[260px]">
          <h3 class="font-semibold text-gray-700 mb-8">Order Status</h3>
          <div class="flex items-center gap-4">
            <div class="w-36 h-36 relative">
              <canvas ref="doughnutCanvas" class="w-full h-full"></canvas>
            </div>

            <div class="flex-1">
              <div v-for="s in orderStatusList" :key="s.label" class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <div :style="{color: s.color}" class="text-lg">●</div>
                  <div class="text-sm text-gray-600">{{ s.label }}</div>
                </div>
                <div class="text-sm font-semibold text-gray-700">{{ s.value }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-4">
        <div class="space-y-4 p-4">
          <!-- Orders To Pick Up Card -->
          <div class="bg-white rounded-xl p-4 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-xs text-gray-500 mb-2">Orders To Pick Up</div>
                <div class="text-2xl text-center font-bold text-gray-800">{{ ordersToPickUp }}</div>
              </div>
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <img :src="OrdersToPickUp" alt="Orders to Pick Up" class="w-6 h-6" />
              </div>
            </div>
          </div>

          <!-- Orders To Deliver Card -->
          <div class="bg-white rounded-xl p-4 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-xs text-gray-500 mb-2">Orders To Deliver</div>
                <div class="text-2xl text-center font-bold text-gray-800">{{ ordersToDeliver }}</div>
              </div>
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <img :src="OrdersToDeliver" alt="Orders to Deliver" class="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        <div class="col-span-2 bg-white rounded-xl p-4 shadow-sm">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-semibold text-gray-700">Recent Orders</h3>
            <div class="text-xs text-gray-500">Latest</div>
          </div>

          <div class="overflow-auto max-h-40">
            <table class="w-full text-sm">
              <thead class="text-left text-xs text-gray-500 border-b">
                <tr>
                  <th class="pb-3">Order ID</th>
                  <th class="pb-3">Name</th>
                  <th class="pb-3">Date</th>
                  <th class="pb-3">Status</th>
                  <th class="pb-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="o in recentOrders" :key="o.id" class="border-b last:border-b-0">
                  <td class="py-3 text-gray-700">#{{ o.id }}</td>
                  <td class="py-3 text-gray-600">{{ o.name }}</td>
                  <td class="py-3 text-gray-500">{{ o.date }}</td>
                  <td class="py-3 font-medium" :class="getStatusColor(o.status)">
                    {{ formatStatus(o.status) }}
                  </td>
                  <td class="py-3 text-gray-800">{{ formatCurrency(o.amount ?? 0) }}</td>
                </tr>
              </tbody>
            </table>
            <div v-if="recentOrders.length === 0" class="text-center text-gray-500 py-6">No recent orders</div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<style scoped>
/* tweak scrollbar for the recent orders area for better look */
::-webkit-scrollbar {
  height: 8px;
  width: 10px;
}
::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.12);
  border-radius: 6px;
}
</style>