<script setup lang="ts">
import AdminLayout from "@/Layout/AdminLayout.vue"
import { MagnifyingGlassIcon, FunnelIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import { useOrders } from "@/api/admin/useOrder"
import AdminOrderDetails from "@/components/AdminOrderDetails.vue"
import Swal from 'sweetalert2'
import type { SweetAlertOptions } from 'sweetalert2'
import { ref, computed, onMounted, watch } from 'vue'

const {
  searchQuery,
  orders,
  isLoading,
  backendError,
  selectedOrder,
  isModalOpen,
  stats,
  openOrderDetails,
  closeModal,
  fetchOrders,
  handleAction,
  getActionButtons,
  getDisplayStatus,
  formatDate,
  getProductName,
  getCustomerName,
  formatPrice,
  getStatusColor
} = useOrders()

const isFilterOpen = ref(false)
const activeStatusFilter = ref('all')
const displayedOrders = ref<any[]>([])

const loadOrders = async () => {
  await fetchOrders()
  displayedOrders.value = [...orders.value]
}
onMounted(loadOrders)

// Get the latest order for the update banner
const latestOrder = computed(() => {
  if (!orders.value.length) return null
  
  return orders.value.reduce((latest, order) => {
    const currentDate = new Date(order.created_at || order.pickup_datetime)
    const latestDate = new Date(latest.created_at || latest.pickup_datetime)
    return currentDate > latestDate ? order : latest
  })
})

// Format time ago for the latest update
const getTimeAgo = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  return `${Math.floor(diffInSeconds / 86400)} days ago`
}

const getStatusFromStatLabel = (label: string): string => {
  const statusMap: Record<string, string> = {
    'Pending Orders': 'pending',
    'Preparing Orders': 'preparing',
    'To Pickup Orders': 'to_pickup',
    'To Pick-Up Orders': 'to_pickup',
    'To Deliver Orders': 'to_deliver',
    'Delivered Orders': 'delivered',
    'Cancelled Orders': 'cancelled'
  }
  return statusMap[label] || 'all'
}

const filterOrders = () => {
  const normalize = (val: string) =>
    val?.toLowerCase().replace(/[-_\s]+/g, '_') || ''

  let filtered = [...orders.value]

  if (activeStatusFilter.value !== 'all') {
    filtered = filtered.filter(order => {
      const orderStatus = normalize(order.status)
      const activeStatus = normalize(activeStatusFilter.value)
      return orderStatus.includes(activeStatus)
    })
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(order =>
      getCustomerName(order).toLowerCase().includes(q) ||
      getProductName(order).toLowerCase().includes(q) ||
      (order.order_id?.toString() || '').includes(q) ||
      (order.id?.toString() || '').includes(q)
    )
  }

  displayedOrders.value = filtered
}

const applyFilter = (status: string) => {
  activeStatusFilter.value = status
  isFilterOpen.value = false
  filterOrders()
}

const getCurrentFilterLabel = computed(() => {
  const options = [
    { label: 'All Orders', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Preparing', value: 'preparing' },
    { label: 'To Pick-Up', value: 'to_pickup' },
    { label: 'To Deliver', value: 'to_deliver' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' }
  ]
  return options.find(o => o.value === activeStatusFilter.value)?.label || 'All Orders'
})

const clearFilters = () => {
  activeStatusFilter.value = 'all'
  searchQuery.value = ''
  displayedOrders.value = [...orders.value]
}

const getSwalConfig = (action: string, orderId: string): SweetAlertOptions => {
  const configs: Record<string, SweetAlertOptions> = {
    approve: {
      title: 'Approve Order?',
      text: `Are you sure you want to APPROVE Order #${orderId}?`,
      icon: 'question',
      confirmButtonText: 'Yes, Approve!',
      confirmButtonColor: '#10B981',
      showCancelButton: true,
      cancelButtonText: 'Cancel'
    },
    cancel: {
      title: 'Cancel Order?',
      text: `Are you sure you want to CANCEL Order #${orderId}? This action cannot be undone.`,
      icon: 'warning',
      confirmButtonText: 'Yes, Cancel!',
      confirmButtonColor: '#EF4444',
      showCancelButton: true,
      cancelButtonText: 'Keep Order'
    },
    mark_preparing: {
      title: 'Mark as Preparing?',
      text: `Are you sure you want to mark Order #${orderId} as PREPARING?`,
      icon: 'info',
      confirmButtonText: 'Yes, Mark Preparing!',
      confirmButtonColor: '#3B82F6',
      showCancelButton: true,
      cancelButtonText: 'Cancel'
    },
    mark_to_deliver: {
      title: 'Mark for Delivery?',
      text: `Are you sure you want to mark Order #${orderId} as TO DELIVER?`,
      icon: 'info',
      confirmButtonText: 'Yes, Mark for Delivery!',
      confirmButtonColor: '#8B5CF6',
      showCancelButton: true,
      cancelButtonText: 'Cancel'
    }
  }

  return configs[action] || {
    title: 'Confirm Action',
    text: `Are you sure you want to perform this action on Order #${orderId}?`,
    icon: 'question',
    confirmButtonText: 'Confirm',
    confirmButtonColor: '#6B7280',
    showCancelButton: true,
    cancelButtonText: 'Cancel'
  }
}

const handleActionWithSweetAlert = async (orderId: string, action: string) => {
  const swalConfig = getSwalConfig(action, orderId)
  const result = await Swal.fire(swalConfig)

  if (result.isConfirmed) {
    try {
      await handleAction(orderId, action)
      await loadOrders()
      filterOrders()
      Swal.fire({
        title: 'Success!',
        text: 'Action completed successfully',
        icon: 'success',
        confirmButtonColor: '#10B981',
        timer: 2000,
        showConfirmButton: false
      })
    } catch (error: any) {
      Swal.fire({
        title: 'Error!',
        text: error.message || 'An error occurred while processing your request',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      })
    }
  }
}


const getDisplayProduct = (order: any) => {
  const productName = getProductName(order)
  if (order.items && Array.isArray(order.items) && order.items.length > 1) {
    const first = order.items[0]
    const name = first.product_name || first.gallon_name || first.name || 'Product'
    const qty = first.quantity || 1
    return `${qty}x ${name} +${order.items.length - 1} more`
  }

  if (order.products && order.products.includes(',')) {
    const products = order.products.split(',')
    if (products.length > 1) {
      return `${products[0].trim()} + ${products.length - 1} more`
    }
  }

  return productName
}

watch([searchQuery, activeStatusFilter], filterOrders)
</script>

<template>
  <AdminLayout>
    <div class="min-h-screen pb-16 font-rem">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-primary">Orders</h1>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition cursor-pointer">
            <div class="flex flex-col items-center justify-center text-center">
              <p class="text-2xl text-primary font-bold mb-1">{{ stat.count }}</p>
              <p class="text-sm font-medium text-gray-600">{{ stat.label }}</p>
            </div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-6 my-4">
          <div class="relative w-full sm:w-72">
            <MagnifyingGlassIcon class="w-5 h-5 text-gray-400 absolute left-3 top-3" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search orders..."
              class="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
          </div>

          <div class="flex items-center gap-3 self-end sm:self-auto">
            <div class="relative">
              <button
                @click="isFilterOpen = !isFilterOpen"
                class="flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition font-medium"
              >
                <FunnelIcon class="w-5 h-5" />
                <span>Filter</span>
              </button>

              <transition name="fade">
                <div
                  v-if="isFilterOpen"
                  class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden"
                >
                  <ul class="py-1 text-gray-700 text-sm">
                    <li 
                      v-for="(option, index) in [
                        { label: 'All Orders', value: 'all' },
                        { label: 'Pending', value: 'pending' },
                        { label: 'Preparing', value: 'preparing' },
                        { label: 'To Pick-Up', value: 'to_pickup' },
                        { label: 'To Deliver', value: 'to_deliver' },
                        { label: 'Delivered', value: 'delivered' },
                        { label: 'Cancelled', value: 'cancelled' }
                      ]"
                      :key="index"
                      @click="applyFilter(option.value)"
                      class="flex items-center justify-between px-4 py-2 hover:bg-cyan-50 cursor-pointer transition"
                      :class="{
                        'bg-cyan-50 text-cyan-700': activeStatusFilter === option.value
                      }"
                    >
                      <span>{{ option.label }}</span>
                      <span v-if="activeStatusFilter === option.value" class="text-cyan-600">✓</span>
                    </li>
                  </ul>
                </div>
              </transition>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div v-if="isLoading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
          </div>

          <div v-else class="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-b sticky top-0 z-10 text-sm">
                <tr class="text-center">
                  <th class="py-3 px-4 font-normal whitespace-nowrap">Order ID</th>
                  <th class="py-3 px-4 font-normal whitespace-nowrap">Customer Name</th>
                  <th class="py-3 px-8 font-normal whitespace-nowrap">Product</th>
                  <th class="py-3 px-4 font-normal whitespace-nowrap">Total Amount</th>
                  <th class="py-3 px-8 font-normal whitespace-nowrap">Date & Time</th>
                  <th class="py-3 px-8 font-normal whitespace-nowrap">Order Status</th>
                  <th class="py-3 px-8 font-normal whitespace-nowrap">View Details</th>
                  <th class="py-3 px-4 font-normal whitespace-nowrap">Action</th>
                </tr>
              </thead>

              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-if="displayedOrders.length === 0">
                  <td colspan="8" class="px-6 py-12 text-center text-gray-500">
                    <p class="font-medium text-lg">No orders found</p>
                    <p class="text-sm mt-1">
                      <span v-if="activeStatusFilter !== 'all' || searchQuery.trim()">
                        No orders match your current filters.
                        <button @click="clearFilters" class="text-cyan-600 hover:text-cyan-800 font-medium ml-1">
                          Clear filters
                        </button>
                        to show all orders.
                      </span>
                      <span v-else>No orders available</span>
                    </p>
                  </td>
                </tr>

                <tr
                  v-for="order in displayedOrders"
                  :key="`${order.order_id}-${order.status}`"
                  class="hover:bg-gray-50 transition-colors text-center text-xs">
                  <td class="table-cell">{{ order.order_id }}</td>
                  <td class="table-cell">{{ getCustomerName(order) }}</td>
                  <td class="table-cell">{{ getDisplayProduct(order) }}</td>
                  <td class="table-cell">{{ formatPrice(order.total_price) }}</td>
                  <td class="table-cell">{{ formatDate(order.pickup_datetime) }}</td>
                  <td class="px-6 py-4">
                    <span :class="[getStatusColor(order.status), 'px-3 py-1 rounded-full text-xs font-medium']">
                      {{ getDisplayStatus(order.status) }}
                    </span>
                  </td>
                  <td class="px-3 py-4">
                    <button
                      @click="openOrderDetails(order)"
                      class="px-4 py-1.5 text-sm underline font-medium transition"
                    >
                      View Details
                    </button>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <div class="flex flex-col gap-1 items-center">
                      <button
                        v-for="action in getActionButtons(order.status)"
                        :key="action"
                        @click="handleActionWithSweetAlert(order.order_id, action)"
                        class="w-36 text-white font-medium py-1.5 rounded-lg transition"
                        :class="{
                          'bg-green-500 hover:bg-green-600': action === 'approve',
                          'bg-red-500 hover:bg-red-600': action === 'cancel',
                          'bg-blue-500 hover:bg-blue-600': action === 'mark_preparing',
                          'bg-sky-500 hover:bg-sky-600': action === 'mark_to_deliver'
                        }"
                      >
                        {{
                          action === 'approve' ? 'Approve' :
                          action === 'cancel' ? 'Cancel' :
                          action === 'mark_preparing' ? 'Mark as Preparing' :
                          action === 'mark_to_deliver' ? 'Mark for Delivery' : ''
                        }}
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <AdminOrderDetails
      :isOpen="isModalOpen"
      :selectedOrder="selectedOrder"
      @close="closeModal"
    />
  </AdminLayout>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>