<script setup lang="ts">
import AdminLayout from "@/Layout/AdminLayout.vue"
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/vue/24/outline'
import { useOrders } from "@/api/admin/useOrder"
import AdminOrderDetails from "@/components/AdminOrderDetails.vue"
import ConfirmModal from "@/components/ConfirmModal.vue"
import { ref, onMounted, watch, computed } from 'vue'

const {
  searchQuery,
  orders,
  isLoading,
  backendError: _backendError,
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
const localOrders = ref<any[]>([])

// Confirmation modal state
const showConfirmModal = ref(false)
const confirmModalConfig = ref({
  title: '',
  message: '',
  type: 'warning' as 'warning' | 'success' | 'error',
  orderId: '',
  action: ''
})

// Success modal state
const showSuccessModal = ref(false)

const sortOrdersByUpdateDate = (ordersList: any[]) => {
  return [...ordersList].sort((a, b) => {
    const dateA = new Date(a.updated_at || a.created_at || a.pickup_datetime || 0).getTime()
    const dateB = new Date(b.updated_at || b.created_at || b.pickup_datetime || 0).getTime()
    return dateB - dateA
  })
}

const updateOrderTimestamp = (orderId: string) => {
  const index = localOrders.value.findIndex(order =>
    order.order_id === orderId || order.id?.toString() === orderId
  )
  if (index !== -1) {
    const order = {
      ...localOrders.value[index],
      updated_at: new Date().toISOString()
    }
    localOrders.value.splice(index, 1)
    localOrders.value.unshift(order)
  }
}

const updateOrderStatusLocally = (orderId: string, newStatus: string) => {
  const index = localOrders.value.findIndex(order =>
    order.order_id === orderId || order.id?.toString() === orderId
  )
  if (index !== -1) {
    localOrders.value[index] = {
      ...localOrders.value[index],
      status: newStatus,
      updated_at: new Date().toISOString()
    }
    localOrders.value = sortOrdersByUpdateDate(localOrders.value)
  }
}

const displayedOrders = computed(() => {
  const normalize = (v: string) => v?.toLowerCase().replace(/[-_\s]+/g, '_') || ''
  let filtered = [...localOrders.value]

  if (activeStatusFilter.value !== 'all') {
    filtered = filtered.filter(order =>
      normalize(order.status).includes(normalize(activeStatusFilter.value))
    )
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

  return Array.from(new Map(
    filtered.map(order => [order.order_id || order.id?.toString(), order])
  ).values())
})

const applyFilter = (status: string) => {
  activeStatusFilter.value = status
  isFilterOpen.value = false
}

const clearFilters = () => {
  activeStatusFilter.value = 'all'
  searchQuery.value = ''
}

const getModalConfig = (action: string, orderId: string) => {
  const configs: Record<string, any> = {
    approve: {
      title: 'Approve Order?',
      message: `Are you sure you want to APPROVE Order ${orderId}?`,
      type: 'warning'
    },
    cancel: {
      title: 'Cancel Order?',
      message: 'This cannot be undone.',
      type: 'error'
    },
    mark_preparing: {
      title: 'Mark as Preparing?',
      message: `Update Order ${orderId} status to Preparing?`,
      type: 'warning'
    },
    mark_to_deliver: {
      title: 'Mark for Delivery?',
      message: `Update Order ${orderId} status to To Deliver?`,
      type: 'warning'
    }
  }
  return configs[action]
}

const getExpectedStatusAfterAction = (action: string): string => {
  const map: Record<string, string> = {
    approve: 'preparing',
    mark_preparing: 'preparing',
    mark_to_deliver: 'to_deliver',
    cancel: 'cancelled'
  }
  return map[action] || 'pending'
}

const handleActionWithConfirm = (orderId: string, action: string) => {
  const config = getModalConfig(action, orderId)
  confirmModalConfig.value = {
    ...config,
    orderId,
    action
  }
  showConfirmModal.value = true
}

const confirmAction = async () => {
  showConfirmModal.value = false
  
  const { orderId, action } = confirmModalConfig.value

  try {
    const newStatus = getExpectedStatusAfterAction(action)

    await handleAction(orderId, action)
    await fetchOrders()
    
    updateOrderStatusLocally(orderId, newStatus)
    updateOrderTimestamp(orderId)

    // Show success modal
    showSuccessModal.value = true
    setTimeout(() => {
      showSuccessModal.value = false
    }, 1600)
  } catch (error) {
    console.error("Action failed:", error)
  }
}

const getDisplayProduct = (order: any) => {
  const name = getProductName(order)
  if (order.items?.length > 1) return `${order.items[0].quantity}x ${order.items[0].product_name} +${order.items.length - 1} more`
  return name
}

const formatDateTime = (order: any) => formatDate(order.updated_at || order.pickup_datetime)
const loadOrders = async () => await fetchOrders()

onMounted(loadOrders)

watch(orders, (newOrders) => {
  localOrders.value = sortOrdersByUpdateDate(newOrders)
}, { immediate: true })
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
                  <th class="py-3 px-8 font-normal whitespace-nowrap">Last Updated</th>
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
                  :key="order.order_id"
                  class="hover:bg-gray-50 transition-colors text-center text-xs">
                  <td class="table-cell">{{ order.order_id }}</td>
                  <td class="table-cell">{{ getCustomerName(order) }}</td>
                  <td class="table-cell">{{ getDisplayProduct(order) }}</td>
                  <td class="table-cell">{{ formatPrice(order.total_price) }}</td>
                  <td class="table-cell">{{ formatDateTime(order) }}</td>
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
                        @click="handleActionWithConfirm(order.order_id, action)"
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

    <!-- Order Details Modal -->
    <AdminOrderDetails
      :isOpen="isModalOpen"
      :selectedOrder="selectedOrder"
      @close="closeModal"
    />

    <!-- Confirmation Modal -->
    <ConfirmModal
      :visible="showConfirmModal"
      :title="confirmModalConfig.title"
      :message="confirmModalConfig.message"
      :type="confirmModalConfig.type"
      :showCancel="true"
      confirmText="Yes, Confirm"
      cancelText="Cancel"
      @confirm="confirmAction"
      @cancel="showConfirmModal = false"
      @close="showConfirmModal = false"
    />

    <!-- Success Modal -->
    <ConfirmModal
      :visible="showSuccessModal"
      title="Success!"
      message="Order has been updated successfully."
      type="success"
      :showCancel="false"
      confirmText="OK"
      @confirm="showSuccessModal = false"
      @close="showSuccessModal = false"
    />
  </AdminLayout>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active { transition: opacity .2s }
.fade-enter-from,
.fade-leave-to { opacity: 0 }
</style>