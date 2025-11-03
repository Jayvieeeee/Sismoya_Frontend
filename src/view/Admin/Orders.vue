<script setup lang="ts">
import AdminLayout from "@/Layout/AdminLayout.vue"
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/vue/24/outline'
import { useOrders } from "@/api/admin/useOrder"
import AdminOrderDetails from "@/components/AdminOrderDetails.vue"
import Modal from "@/components/Modal.vue"
import { ref } from 'vue'
import Swal from 'sweetalert2'
import type { SweetAlertOptions } from 'sweetalert2'

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

const getSwalConfig = (action: string, orderId: number): SweetAlertOptions => {
  const configs: Record<string, SweetAlertOptions> = {
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

  const result = await Swal.fire(swalConfig as SweetAlertOptions)

  if (result.isConfirmed) {
    try {
      await handleAction(numericOrderId, action)

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
</script>

<template>
  <AdminLayout>
    <div class="min-h-screen pb-16 font-rem">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-primary">Orders</h1>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition cursor-pointer"
            @click="filterByStatus(stat.label)"
          >
            <div class="flex flex-col items-center justify-center text-center">
              <p class="text-2xl text-primary font-bold mb-1">{{ stat.count }}</p>
              <p class="text-sm font-medium text-gray-600">{{ stat.label }}</p>
            </div>
          </div>
        </div>

        <!-- Search and Filter Section -->
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

          <!-- Filter Button -->
          <div class="relative self-end sm:self-auto">
            <button
              @click="isFilterOpen = !isFilterOpen"
              class="flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition font-medium"
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
                <button @click="fetchOrders()" class="dropdown-btn">All Orders</button>
                <button @click="filterByStatus('pending')" class="dropdown-btn">Pending</button>
                <button @click="filterByStatus('to_pick_up')" class="dropdown-btn">To Pick-Up</button>
                <button @click="filterByStatus('preparing')" class="dropdown-btn">Preparing</button>
                <button @click="filterByStatus('to_deliver')" class="dropdown-btn">To Deliver</button>
                <button @click="filterByStatus('completed')" class="dropdown-btn">Completed</button>
                <button @click="filterByStatus('cancelled')" class="dropdown-btn">Cancelled</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Orders Table -->
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
          <th class="py-3 px-4 font-normal whitespace-nowrap">Product</th>
          <th class="py-3 px-4 font-normal whitespace-nowrap">Total Amount</th>
          <th class="py-3 px-4 font-normal whitespace-nowrap">Date & Time</th>
          <th class="py-3 px-8 font-normal whitespace-nowrap">Order Status</th>
          <th class="py-3 px-8 font-normal whitespace-nowrap">View Details</th>
          <th class="py-3 px-4 font-normal whitespace-nowrap">Action</th>
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
                  class="hover:bg-gray-50 transition-colors text-center text-sm">
                  <td class="table-cell">#{{ order.order_id || order.id }}</td>
                  <td class="table-cell">{{ getCustomerName(order) }}</td>
                  <td class="table-cell">{{ getProductName(order) }}</td>
                  <td class="table-cell">{{ formatPrice(order.total_price || order.totalAmount) }}</td>
                  <td class="table-cell">{{ formatDate(order.date_time || order.created_at) }}</td>
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
                      v-if="getActionButtons(order.status).includes('approve')"
                      @click="handleActionWithSweetAlert(order.order_id || order.id, 'approve', order.status)"
                      class="w-36 bg-green-500 hover:bg-green-600 text-white font-medium py-1.5 rounded-lg transition"
                    >
                      Approve
                    </button>

                    <button
                      v-if="getActionButtons(order.status).includes('cancel')"
                      @click="handleActionWithSweetAlert(order.order_id || order.id, 'cancel', order.status)"
                      class="w-36 bg-red-500 hover:bg-red-600 text-white font-medium py-1.5 rounded-lg transition"
                    >
                      Cancel
                    </button>

                    <button
                      v-if="getActionButtons(order.status).includes('mark_preparing')"
                      @click="handleActionWithSweetAlert(order.order_id || order.id, 'mark_preparing', order.status)"
                      class="w-36 bg-blue-500 hover:bg-blue-600 text-white font-medium py-1.5 rounded-lg transition"
                    >
                      Mark as Preparing
                    </button>

                    <button
                      v-if="getActionButtons(order.status).includes('mark_to_deliver')"
                      @click="handleActionWithSweetAlert(order.order_id || order.id, 'mark_to_deliver', order.status)"
                      class="w-36 bg-sky-500 hover:bg-sky-600 text-white font-medium py-1.5 rounded-lg transition"
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

    <!-- Message Modal -->
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

