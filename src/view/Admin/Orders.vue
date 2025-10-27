<script setup lang="ts">
import AdminLayout from "@/Layout/AdminLayout.vue"
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/vue/24/outline'
import { useOrders } from "@/api/admin/useOrder"
import AdminOrderDetails from "@/components/AdminOrderDetails.vue"
import Modal from "@/components/Modal.vue"
import { ref } from 'vue'
import Swal from 'sweetalert2'

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
  filterByStatus,
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

// Modal state for backend messages
const showMessageModal = ref(false)
const modalMessage = ref('')
const modalTitle = ref('')

// Close message modal
const closeMessageModal = () => {
  showMessageModal.value = false
  modalMessage.value = ''
  modalTitle.value = ''
}

// Get SweetAlert configuration based on action
const getSwalConfig = (action: string, orderId: number) => {
  const configs: { [key: string]: any } = {
    'approve': {
      title: 'Approve Order?',
      text: `Are you sure you want to APPROVE Order #${orderId}?`,
      icon: 'question',
      confirmButtonText: 'Yes, Approve!',
      confirmButtonColor: '#10B981',
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      iconColor: '#10B981'
    },
    'cancel': {
      title: 'Cancel Order?',
      text: `Are you sure you want to CANCEL Order #${orderId}? This action cannot be undone.`,
      icon: 'warning',
      confirmButtonText: 'Yes, Cancel!',
      confirmButtonColor: '#EF4444',
      showCancelButton: true,
      cancelButtonText: 'Keep Order',
      iconColor: '#EF4444'
    },
    'mark_preparing': {
      title: 'Mark as Preparing?',
      text: `Are you sure you want to mark Order #${orderId} as PREPARING?`,
      icon: 'info',
      confirmButtonText: 'Yes, Mark Preparing!',
      confirmButtonColor: '#3B82F6',
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      iconColor: '#3B82F6'
    },
    'mark_to_deliver': {
      title: 'Mark for Delivery?',
      text: `Are you sure you want to mark Order #${orderId} as TO DELIVER?`,
      icon: 'info',
      confirmButtonText: 'Yes, Mark for Delivery!',
      confirmButtonColor: '#8B5CF6',
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      iconColor: '#8B5CF6'
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

const handleActionWithSweetAlert = async (orderId: string | number, action: string, status: string) => {
  const numericOrderId = typeof orderId === 'string' ? parseInt(orderId, 10) : orderId
  
  const swalConfig = getSwalConfig(action, numericOrderId)
  
  const result = await Swal.fire(swalConfig)
  
  if (result.isConfirmed) {
    try {
      // Call the original handleAction
      await handleAction(numericOrderId, action, status)
      
      // Show success message
      Swal.fire({
        title: 'Success!',
        text: 'Action completed successfully',
        icon: 'success',
        confirmButtonColor: '#10B981',
        timer: 2000,
        showConfirmButton: false
      })
      
    } catch (error: any) {
      // Show error message
      Swal.fire({
        title: 'Error!',
        text: error.message || 'An error occurred while processing your request',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      })
    }
  }
}
</script>

<template>
  <AdminLayout>
    <div class="min-h-screen pb-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-primary">Orders</h1>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 bg-[#077ebe] p-4 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-2">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            @click="filterByStatus(stat.label)"
          >
            <div class="flex flex-col items-center justify-center text-center">
              <p class="text-3xl text-primary mb-2">{{ stat.count }}</p>
              <p class="text-base font-medium text-gray-600">{{ stat.label }}</p>
            </div>
          </div>
        </div>

        <!-- Search and Filter Section -->
        <div class="rounded-xl p-6 mb-2">
          <div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div class="relative flex-1 w-full sm:max-w-md">
              <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"/>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search order"
                class="w-2/5 pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition"
              />
            </div>
            <div class="flex gap-3 w-full sm:w-auto">
              <!-- Filter Button with Dropdown -->
              <div class="relative">
                <button 
                  @click="isFilterOpen = !isFilterOpen"
                  class="flex items-center gap-2 px-4 py-3 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 transition font-medium"
                  :disabled="!!backendError"
                >
                  <FunnelIcon class="w-5 h-5" />
                  <span>Filter</span>
                </button>
                
                <!-- Dropdown Menu -->
                <div 
                  v-if="isFilterOpen" 
                  class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                  @click="isFilterOpen = false"
                >
                  <div class="py-1">
                    <button @click="fetchOrders()" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">All Orders</button>
                    <button @click="filterByStatus('pending')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Pending</button>
                    <button @click="filterByStatus('to_pick_up')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">To Pick-Up</button>
                    <button @click="filterByStatus('preparing')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Preparing</button>
                    <button @click="filterByStatus('to_deliver')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">To Deliver</button>
                    <button @click="filterByStatus('completed')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Completed</button>
                    <button @click="filterByStatus('cancelled')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Cancelled</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Orders Table -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div v-if="isLoading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>

          <div v-else class="overflow-x-auto max-h-[330px] overflow-y-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                <tr class="text-center">
                  <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer Name</th>
                  <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                  <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Amount</th>
                  <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order Status</th>
                  <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">View Details</th>
                  <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>

              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-if="orders.length === 0">
                  <td colspan="8" class="px-6 py-12 text-center text-gray-500">
                    <p class="font-medium text-lg">No orders found</p>
                    <p class="text-sm mt-1">Try adjusting your search or filters</p>
                  </td>
                </tr>

                <tr
                  v-for="order in orders"
                  :key="`${order.order_id}-${order.status}`"
                  class="hover:bg-gray-50 transition-colors text-center"
                >
                  <td class="px-6 py-4 text-sm font-medium">#{{ order.order_id || order.id }}</td>
                  <td class="px-6 py-4 text-sm">{{ getCustomerName(order) }}</td>
                  <td class="px-6 py-4 text-sm">{{ getProductName(order) }}</td>
                  <td class="px-6 py-4 text-sm">{{ formatPrice(order.total_price || order.totalAmount) }}</td>
                  <td class="px-6 py-4 text-sm">{{ formatDate(order.date_time || order.created_at) }}</td>
                  <td class="px-6 py-4">
                    <span :class="[getStatusColor(order.status), 'px-3 py-1 rounded-full text-xs font-medium']">
                      {{ getDisplayStatus(order.status) }}
                    </span>
                  </td>

                  <!-- View Details Column -->
                  <td class="px-6 py-4">
                    <button 
                      @click="openOrderDetails(order)"
                      class="px-3 py-1.5 text-sm underline text-blue-600 hover:text-blue-800 font-medium transition"
                    >
                      View Details
                    </button>
                  </td>

                  <!-- Action Column -->
                  <td class="px-4 py-3 whitespace-nowrap">
                    <div class="flex flex-col gap-1 items-center">
                      <!-- Approve Button -->
                      <button
                        v-if="getActionButtons(order.status).includes('approve')"
                        @click="handleActionWithSweetAlert(order.order_id || order.id, 'approve', order.status)"
                        class="px-2 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded transition font-medium w-full"
                      >
                        Approve
                      </button>
                      
                      <!-- Cancel Button -->
                      <button
                        v-if="getActionButtons(order.status).includes('cancel')"
                        @click="handleActionWithSweetAlert(order.order_id || order.id, 'cancel', order.status)"
                        class="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded transition font-medium w-full"
                      >
                        Cancel
                      </button>

                      <!-- Mark as Preparing Button -->
                      <button
                        v-if="getActionButtons(order.status).includes('mark_preparing')"
                        @click="handleActionWithSweetAlert(order.order_id || order.id, 'mark_preparing', order.status)"
                        class="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition font-medium w-full"
                      >
                        Mark as Preparing
                      </button>

                      <!-- Mark for Delivery Button -->
                      <button
                        v-if="getActionButtons(order.status).includes('mark_to_deliver')"
                        @click="handleActionWithSweetAlert(order.order_id || order.id, 'mark_to_deliver', order.status)"
                        class="px-2 py-1 bg-purple-500 hover:bg-purple-600 text-white text-xs rounded transition font-medium w-full"
                      >
                        Mark for Delivery
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

    <!-- Message Modal for backend responses (fallback) -->
    <Modal
      :visible="showMessageModal"
      :title="modalTitle"
      @close="closeMessageModal"
    >
      <p>{{ modalMessage }}</p>
      
      <template #actions>
        <button
          @click="closeMessageModal"
          class="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition"
        >
          OK
        </button>
      </template>
    </Modal>

  </AdminLayout>
</template>