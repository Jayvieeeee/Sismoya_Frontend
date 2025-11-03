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
  status: "pending" | "cancelled" | "preparing" | "to_pickup" | "to_deliver" | "delivered" | string
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
          barThickness: 18,
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
            font: { size: 12 },
            maxRotation: 45,
            minRotation: 45
          }
        },
        y: {
          beginAtZero: true,
          grid: { color: "rgba(0,0,0,0.04)" },
          ticks: {
            callback: (val) => (Number(val) >= 1000 ? `₱${Number(val)/1000}k` : `${Number(val)}`),
            color: "#6B7280",
            font: { size: 12 }
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
          hoverOffset: 6,
        }
      ]
    },
    options: {
      cutout: "60%" as any,
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
  
  // Ensure all statuses are included
  if (map["pending"] || map["pending"] === 0) list.push({ label: "Pending", value: map["pending"], color: "#f97316" })
  if (map["preparing"] || map["preparing"] === 0) list.push({ label: "Preparing", value: map["preparing"], color: "#3b82f6" })
  if (map["cancelled"] || map["cancelled"] === 0) list.push({ label: "Cancelled", value: map["cancelled"], color: "#ef4444" })
  if (map["to_pickup"] || map["to_pickup"] === 0) list.push({ label: "To Pickup", value: map["to_pickup"], color: "#8b5cf6" })
  if (map["to_deliver"] || map["to_deliver"] === 0) list.push({ label: "To Deliver", value: map["to_deliver"], color: "#06b6d4" })
  if (map["delivered"] || map["delivered"] === 0) list.push({ label: "Delivered", value: map["delivered"], color: "#10b981" })
  
  orderStatusList.value = list
}

// Format status for display
const formatStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': 'Pending',
    'preparing': 'Preparing',
    'cancelled': 'Cancelled',
    'to_pickup': 'To Pickup',
    'to_deliver': 'To Deliver',
    'delivered': 'Delivered'
  }
  return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1)
}

// Get status color class
const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'pending': 'text-orange-500',
    'preparing': 'text-blue-500',
    'cancelled': 'text-red-500',
    'to_pickup': 'text-purple-500',
    'to_deliver': 'text-cyan-500',
    'delivered': 'text-green-600'
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
      return
    }
    const d = resp.data.data

    // Update current date and time
    currentDate.value = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    currentTime.value = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })

    stats.value = [
      { 
        label: "Delivered Orders Today", 
        value: d.stats?.completed_today || d.stats?.delivered_today || 0 
      },
      { 
        label: "Total Sales Today", 
        value: formatCurrency(d.stats?.total_sales_today || 0) 
      },
      { 
        label: "Pending Orders", 
        value: d.stats?.pending_orders || 0 
      },
      { 
        label: "Total Customers", 
        value: d.stats?.total_customers || 0 
      }
    ]

    // Fix these too:
    ordersToPickUp.value = d.order_status_distribution?.to_pickup || 0
    ordersToDeliver.value = d.order_status_distribution?.to_deliver || 0


    // Process sales data - handle different possible structures
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

    // Sales data - try multiple possible field structures
    const salesData = d.sales_revenue || d.salesRevenue || d.sales || d.revenue || d.sales_data || {}
    
    // Use dynamic label lengths
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

    // Build order status map - handle multiple possible field structures
    const statusData = d.order_status_distribution || d.orderStatus || d.orders_by_status || d.status_distribution || {}
    
    // Ensure all statuses are included
    orderStatusMap.value = {
      pending: statusData.pending || d.pending_orders || 0,
      preparing: statusData.preparing || statusData.preparation || 0,
      cancelled: statusData.cancelled || statusData.canceled || 0,
      to_pickup: statusData.to_pickup || statusData.pickup || d.orders_to_pickup || 0,
      to_deliver: statusData.to_deliver || statusData.delivery || d.orders_to_deliver || 0,
      delivered: statusData.delivered || statusData.completed || d.delivered_orders_today || 0
    }
    buildOrderStatusList()

    // Recent orders - handle multiple possible field structures
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
  }, 30000)
}

// watch activeView changes to re-render bar chart
watch(activeView, () => {
  renderBarChart()
})

// initial fetch
onMounted(() => {
  fetchDashboardData()
  startAutoRefresh()
  setInterval(updateLabels, 60000)
})
</script>

<template>
  <AdminLayout>
    <!-- Main dashboard container - full height, no scroll -->
    <div class="p-4 sm:p-6 h-screen overflow-hidden flex flex-col">
      <!-- Header row -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-4 shrink-0">
        <h1 class="text-2xl sm:text-3xl font-bold text-primary">Dashboard</h1>
        <div class="flex gap-3 items-center">
          <div class="bg-white px-3 py-2 rounded-lg shadow text-sm font-medium">{{ currentDate }}</div>
          <div class="bg-white px-3 py-2 rounded-lg shadow text-sm font-medium">{{ currentTime }}</div>
        </div>
      </div>

      <!-- Content area (fills remaining height) -->
      <div class="flex-1 flex flex-col justify-between overflow-hidden">
        <!-- Top stats -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="stat in stats" :key="stat.label" class="bg-white rounded-xl p-4 shadow-sm h-24 flex flex-col justify-center">
            <div class="text-xl font-bold text-primary mb-1">{{ stat.value }}</div>
            <div class="text-gray-600 text-sm">{{ stat.label }}</div>
          </div>
        </div>

        <!-- Middle charts section -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1 my-2">
          <div class="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
              <h3 class="font-semibold text-gray-800 text-lg">Sales Revenue</h3>
              <div class="flex gap-2">
                <button
                  :class="{'bg-sky-500 text-white': activeView==='daily', 'bg-gray-200 text-gray-700': activeView!=='daily'}"
                  class="px-3 py-1.5 text-sm rounded-lg font-medium"
                  @click="activeView = 'daily'"
                >Daily</button>
                <button
                  :class="{'bg-sky-500 text-white': activeView==='weekly', 'bg-gray-200 text-gray-700': activeView!=='weekly'}"
                  class="px-3 py-1.5 text-sm rounded-lg font-medium"
                  @click="activeView = 'weekly'"
                >Weekly</button>
                <button
                  :class="{'bg-sky-500 text-white': activeView==='monthly', 'bg-gray-200 text-gray-700': activeView!=='monthly'}"
                  class="px-3 py-1.5 text-sm rounded-lg font-medium"
                  @click="activeView = 'monthly'"
                >Monthly</button>
              </div>
            </div>
            <div class="w-full h-44">
              <canvas ref="barCanvas" class="w-full h-full"></canvas>
            </div>
          </div>

          <div class="bg-white rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <h3 class="font-semibold text-gray-800 text-lg mb-4">Order Status</h3>
            <div class="flex flex-col sm:flex-row items-center gap-4">
              <div class="w-28 h-28">
                <canvas ref="doughnutCanvas" class="w-full h-full"></canvas>
              </div>
              <div class="flex-1">
                <div v-for="s in orderStatusList" :key="s.label" class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <div :style="{color: s.color}" class="text-lg">●</div>
                    <div class="text-sm text-gray-700 font-medium">{{ s.label }}</div>
                  </div>
                  <div class="text-sm font-bold text-gray-800">{{ s.value }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom section -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div class="space-y-3">
            <div class="bg-white rounded-xl p-4 shadow-sm">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-sm text-gray-600 mb-2">Orders To Pick Up</div>
                  <div class="text-2xl font-bold text-gray-800">{{ ordersToPickUp }}</div>
                </div>
                <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <img :src="OrdersToPickUp" alt="Orders to Pick Up" class="w-6 h-6" />
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl p-4 shadow-sm">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-sm text-gray-600 mb-2">Orders To Deliver</div>
                  <div class="text-2xl font-bold text-gray-800">{{ ordersToDeliver }}</div>
                </div>
                <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <img :src="OrdersToDeliver" alt="Orders to Deliver" class="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>

          <div class="lg:col-span-2 bg-white rounded-xl p-3 mb-8 shadow-sm">
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-gray-800 text-sm">Recent Orders</h3>
              <div class="text-sm text-gray-500 font-medium">Latest</div>
            </div>

            <table class="w-full text-sm">
              <thead class="text-left text-gray-600 border-b">
                <tr>
                  <th class="pb-3 pt-2 px-3 font-semibold">Order ID</th>
                  <th class="pb-3 pt-2 px-3 font-semibold">Name</th>
                  <th class="pb-3 pt-2 px-3 font-semibold">Date</th>
                  <th class="pb-3 pt-2 px-3 font-semibold">Status</th>
                  <th class="pb-3 pt-2 px-3 font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="o in recentOrders.slice(0, 3)" :key="o.id" class="border-b hover:bg-gray-50">
                  <td class="py-3 px-3 text-gray-800 font-semibold">#{{ o.id }}</td>
                  <td class="py-3 px-3 text-gray-700 truncate max-w-[100px]">{{ o.name }}</td>
                  <td class="py-3 px-3 text-gray-600 whitespace-nowrap">{{ o.date }}</td>
                  <td class="py-3 px-3 font-medium text-sm" :class="getStatusColor(o.status)">
                    {{ formatStatus(o.status) }}
                  </td>
                  <td class="py-3 px-3 text-gray-800 font-semibold whitespace-nowrap">{{ formatCurrency(o.amount ?? 0) }}</td>
                </tr>
                <tr v-if="recentOrders.length === 0">
                  <td colspan="5" class="py-6 px-3 text-center text-gray-500 text-sm">No recent orders</td>
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
/* Remove scrolling and fit screen height */
.h-screen {
  height: 100vh;
}
.overflow-hidden {
  overflow: hidden;
}

/* Optional subtle hover animation */
.bg-white {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.bg-white:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
</style>
