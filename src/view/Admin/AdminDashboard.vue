<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from "vue"
import axiosInstance from "@/utils/axios"
import AdminLayout from "@/Layout/AdminLayout.vue"
import OrdersToDeliver from "@/assets/icons/orders_to_deliver.png"
import OrdersToPickUp from "@/assets/icons/orders_to_pickup.png"

import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  Title,
  BarController,
} from "chart.js"

// Register all required components
Chart.register(
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Order {
  id: number
  name: string
  date: string
  status: "pending" | "cancelled" | "preparing" | "to_pickup" | "to_deliver" | "delivered" | string
  amount?: number | null
}

// --- UI state ---
const currentDateTime = ref(
  `${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} • ${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`
)

const stats = ref<any[]>([])
const ordersToPickUp = ref(0)
const ordersToDeliver = ref(0)
const recentOrders = ref<Order[]>([])

// sales data arrays prepared from API
const salesDaily = ref<number[]>([])
const salesWeekly = ref<number[]>([])
const salesMonthly = ref<number[]>([])

// order status (rendered as progress bars, not a doughnut)
const orderStatusMap = ref<Record<string, number>>({})
const orderStatusList = ref<{label: string; value: number; color: string; bar: string}[]>([])

// chart refs
let barChart: Chart | null = null
const barCanvas = ref<HTMLCanvasElement | null>(null)

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
          backgroundColor: "#60a5fa",
          borderRadius: 6,
          barThickness: 28,
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
            color: "#9CA3AF",
            font: { size: 12 }
          }
        },
        y: {
          display: false,
          beginAtZero: true,
          grid: { display: false }
        }
      }
    }
  })
}

function buildOrderStatusList() {
  const map = orderStatusMap.value
  const list: {label: string; value: number; color: string; bar: string}[] = []

  const push = (key: string, label: string, color: string, bar: string) => {
    if (map[key] || map[key] === 0) list.push({ label, value: map[key], color, bar })
  }

  push("pending", "Pending", "#f97316", "bg-orange-400")
  push("preparing", "In Progress", "#3b82f6", "bg-blue-500")
  push("delivered", "Completed", "#10b981", "bg-green-500")
  push("to_pickup", "To Pickup", "#8b5cf6", "bg-purple-500")
  push("to_deliver", "To Deliver", "#06b6d4", "bg-cyan-500")
  push("cancelled", "Cancelled", "#ef4444", "bg-red-500")

  const max = Math.max(1, ...list.map(s => s.value))
  orderStatusList.value = list.map(s => ({ ...s, pct: Math.round((s.value / max) * 100) } as any))
}

// Format status for display
const formatStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': 'Pending',
    'preparing': 'In Progress',
    'cancelled': 'Cancelled',
    'to_pickup': 'To Pickup',
    'to_deliver': 'To Deliver',
    'delivered': 'Completed'
  }
  return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1)
}

// Badge classes for status pill (bg + text)
const getStatusBadge = (status: string) => {
  const badges: Record<string, string> = {
    'pending': 'bg-orange-100 text-orange-600',
    'preparing': 'bg-blue-100 text-blue-600',
    'cancelled': 'bg-red-100 text-red-600',
    'to_pickup': 'bg-purple-100 text-purple-600',
    'to_deliver': 'bg-cyan-100 text-cyan-600',
    'delivered': 'bg-green-100 text-green-600'
  }
  return badges[status] || 'bg-gray-100 text-gray-600'
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

function exportReport() {
  // hook up to your export endpoint / CSV generator here
  console.log("Export report clicked")
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
      return
    }
    const d = resp.data.data

    currentDateTime.value = `${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} • ${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`

    stats.value = [
      {
        label: "Completed Orders",
        value: d.stats?.completed_today || d.stats?.delivered_today || 0,
        icon: "check"
      },
      {
        label: "Total Sales",
        value: formatCurrency(d.stats?.total_sales_today || 0),
        icon: "trend"
      },
      {
        label: "Pending Orders",
        value: d.stats?.pending_orders || 0,
        icon: "clock"
      },
      {
        label: "Total Customers",
        value: d.stats?.total_customers || 0,
        icon: "users"
      }
    ]

    ordersToPickUp.value = d.order_status_distribution?.to_pickup || 0
    ordersToDeliver.value = d.order_status_distribution?.to_deliver || 0

    const normalizeArray = (arr: any[], targetLength: number) => {
      const out: number[] = []
      for (let i = 0; i < targetLength; i++) {
        const item = arr[i]
        if (item == null) { out.push(0); continue }
        if (typeof item === "object") {
          out.push(Number(item.total ?? item.amount ?? item.value ?? item.revenue ?? item.sales ?? 0))
        } else {
          out.push(Number(item))
        }
      }
      return out
    }

    const salesData = d.sales_revenue || d.salesRevenue || d.sales || d.revenue || d.sales_data || {}

    salesDaily.value = normalizeArray(
      salesData.daily || salesData.today || salesData.last_7_days || d.daily_sales || [],
      labels.value.daily.length
    )
    salesWeekly.value = normalizeArray(
      salesData.weekly || salesData.weeks || salesData.last_5_weeks || d.weekly_sales || [],
      labels.value.weekly.length
    )
    salesMonthly.value = normalizeArray(
      salesData.monthly || salesData.months || salesData.last_12_months || d.monthly_sales || [],
      labels.value.monthly.length
    )

    const statusData = d.order_status_distribution || d.orderStatus || d.orders_by_status || d.status_distribution || {}

    orderStatusMap.value = {
      pending: statusData.pending || d.pending_orders || 0,
      preparing: statusData.preparing || statusData.preparation || 0,
      cancelled: statusData.cancelled || statusData.canceled || 0,
      to_pickup: statusData.to_pickup || statusData.pickup || d.orders_to_pickup || 0,
      to_deliver: statusData.to_deliver || statusData.delivery || d.orders_to_deliver || 0,
      delivered: statusData.delivered || statusData.completed || d.delivered_orders_today || 0
    }
    buildOrderStatusList()

    const ordersData = d.recent_orders || d.recentOrders || d.latest_orders || d.orders || []

    recentOrders.value = ordersData.map((o: any) => {
      const orderItems = o.order_items || o.items || o.products || ''
      const customerName = extractCustomerName(orderItems) || o.customer_name || o.customer?.name || 'Customer'

      return {
        id: o.order_id || o.id || o.orderId || 0,
        name: customerName,
        date: new Date(o.created_at || o.order_date || o.date || new Date()).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        }),
        status: o.status || o.order_status || 'pending',
        amount: Number(o.total_price || o.amount || o.total || o.price || 0)
      }
    })

    await nextTick()
    renderBarChart()

  } catch (err: any) {
    console.error("fetchDashboardData failed", err.response?.data ?? err.message ?? err)
  }
}

// Auto-refresh data every 30 seconds
const startAutoRefresh = () => {
  setInterval(() => {
    fetchDashboardData()
  }, 30000)
}

watch(activeView, () => {
  renderBarChart()
})

onMounted(() => {
  fetchDashboardData()
  startAutoRefresh()
  setInterval(updateLabels, 60000)
})
</script>

<template>
  <AdminLayout>
    <div class="p-4 sm:p-6 h-screen overflow-hidden flex flex-col bg-white">
      <!-- Header row -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-5 shrink-0">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p class="text-sm text-gray-400 mt-1">{{ currentDateTime }}</p>
        </div>
        <button
          class="mt-3 sm:mt-0 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm transition"
          @click="exportReport"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export Report
        </button>
      </div>

      <!-- Content area -->
      <div class="flex-1 flex flex-col justify-between overflow-hidden gap-5">
        <!-- Top stats -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="stat in stats" :key="stat.label" class="bg-white rounded-2xl p-4 shadow-sm h-24 flex flex-col justify-between">
            <div class="flex items-start justify-between">
              <div class="text-gray-400 text-xs font-medium">{{ stat.label }}</div>
              <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <svg v-if="stat.icon === 'check'" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                <svg v-else-if="stat.icon === 'trend'" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                <svg v-else-if="stat.icon === 'clock'" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
            </div>
            <div class="text-2xl font-bold text-gray-900">{{ stat.value }}</div>
          </div>
        </div>

        <!-- Middle charts section -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1">
          <div class="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
              <h3 class="font-semibold text-gray-800 text-lg">Sales Revenue</h3>
              <div class="flex gap-1 bg-slate-100 rounded-lg p-1">
                <button
                  :class="activeView==='daily' ? 'bg-white shadow text-gray-800' : 'text-gray-500'"
                  class="px-3 py-1.5 text-xs rounded-md font-medium transition"
                  @click="activeView = 'daily'"
                >Day</button>
                <button
                  :class="activeView==='weekly' ? 'bg-white shadow text-gray-800' : 'text-gray-500'"
                  class="px-3 py-1.5 text-xs rounded-md font-medium transition"
                  @click="activeView = 'weekly'"
                >Week</button>
                <button
                  :class="activeView==='monthly' ? 'bg-white shadow text-gray-800' : 'text-gray-500'"
                  class="px-3 py-1.5 text-xs rounded-md font-medium transition"
                  @click="activeView = 'monthly'"
                >Month</button>
              </div>
            </div>
            <div class="w-full h-44">
              <canvas ref="barCanvas" class="w-full h-full"></canvas>
            </div>
          </div>

          <div class="bg-white rounded-2xl p-5 shadow-sm flex flex-col">
            <h3 class="font-semibold text-gray-800 text-lg mb-4">Order Status</h3>
            <div class="flex-1 flex flex-col justify-center gap-4">
              <div v-for="s in orderStatusList" :key="s.label">
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-sm text-gray-600 font-medium">{{ s.label }}</span>
                  <span class="text-sm font-bold" :style="{ color: s.color }">{{ s.value }}</span>
                </div>
                <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div class="h-full rounded-full" :class="s.bar" :style="{ width: (s as any).pct + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom section -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div class="space-y-3">
            <div class="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-blue-500">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-sm text-gray-500">To Pick Up</div>
                  <div class="text-2xl font-bold text-gray-900">{{ ordersToPickUp }}</div>
                </div>
                <div class="w-11 h-11 bg-blue-50 rounded-full flex items-center justify-center">
                  <img :src="OrdersToPickUp" alt="Orders to Pick Up" class="w-5 h-5" />
                </div>
              </div>
            </div>

            <div class="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-blue-500">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-sm text-gray-500">To Deliver</div>
                  <div class="text-2xl font-bold text-gray-900">{{ ordersToDeliver }}</div>
                </div>
                <div class="w-11 h-11 bg-blue-50 rounded-full flex items-center justify-center">
                  <img :src="OrdersToDeliver" alt="Orders to Deliver" class="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          <div class="lg:col-span-2 bg-white rounded-2xl p-4 shadow-sm">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-semibold text-gray-800 text-sm">Recent Orders</h3>
            </div>

            <table class="w-full text-sm">
              <thead class="text-left text-gray-400 border-b">
                <tr>
                  <th class="pb-3 pt-2 px-3 font-medium">Order</th>
                  <th class="pb-3 pt-2 px-3 font-medium">Customer</th>
                  <th class="pb-3 pt-2 px-3 font-medium">Date</th>
                  <th class="pb-3 pt-2 px-3 font-medium">Status</th>
                  <th class="pb-3 pt-2 px-3 font-medium">Amount</th>
                  <th class="pb-3 pt-2 px-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="o in recentOrders.slice(0, 4)" :key="o.id" class="border-b last:border-0 hover:bg-slate-50">
                  <td class="py-3 px-3">
                    <span class="text-blue-600 font-semibold">#{{ String(o.id).padStart(3, '0') }}</span>
                  </td>
                  <td class="py-3 px-3 text-gray-700 truncate max-w-[120px]">{{ o.name }}</td>
                  <td class="py-3 px-3 text-gray-500 whitespace-nowrap">{{ o.date }}</td>
                  <td class="py-3 px-3">
                    <span class="px-2.5 py-1 rounded-full text-xs font-semibold" :class="getStatusBadge(o.status)">
                      {{ formatStatus(o.status) }}
                    </span>
                  </td>
                  <td class="py-3 px-3 text-gray-800 font-semibold whitespace-nowrap">{{ formatCurrency(o.amount ?? 0) }}</td>
                  <td class="py-3 px-3">
                    <a href="#" class="text-blue-600 text-xs font-semibold hover:underline">View</a>
                  </td>
                </tr>
                <tr v-if="recentOrders.length === 0">
                  <td colspan="6" class="py-6 px-3 text-center text-gray-500 text-sm">No recent orders</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<style scoped>
.h-screen {
  height: 100vh;
}
.overflow-hidden {
  overflow: hidden;
}
</style>