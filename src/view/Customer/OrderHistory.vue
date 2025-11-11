<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import axiosInstance from "@/utils/axios";
import CustomerLayout from "@/Layout/CustomerLayout.vue";
import OrderDetailsModal from "@/components/OrderDetailsModal.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import { useRouter } from "vue-router";
import { getProfile } from "@/utils/auth";

const router = useRouter();
const orders = ref<any[]>([]);
const loading = ref(true);
const search = ref("");
const backendError = ref("");
const cancelLoading = ref<string | null>(null);

const isModalOpen = ref(false);
const selectedOrder = ref<any>(null);

// Modal states
const showConfirmModal = ref(false);
const showResultModal = ref(false);
const modalConfig = ref({
  title: '',
  message: '',
  type: 'warning' as 'warning' | 'success' | 'error',
  showCancel: false,
  confirmText: 'OK',
  cancelText: 'Cancel'
});
const orderToCancel = ref<any>(null);

function formatDate(datetime: string): string {
  if (!datetime) return "N/A";
  const date = new Date(datetime);
  return date.toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
    hour12: true,
  });
}

function getDisplayDate(order: any) {
  return order.pickup_datetime
    ? formatDate(order.pickup_datetime)
    : formatDate(order.created_at);
}

function getProductNames(order: any) {
  if (order.items?.length) {
    return order.items.map((item: any) => 
      `${item.gallon_name || item.product_name || "Unknown Product"} x${item.quantity || 1}`
    ).join(', ');
  }
  return "Unknown Product";
}

function getAllProducts(order: any) {
  if (order.items?.length) {
    return order.items.map((item: any) => ({
      name: item.gallon_name || item.product_name || "Unknown Product",
      quantity: item.quantity || 1,
      price: item.price || 0,
      total_price: item.total_price || 0,
      image_url: item.image_url
    }));
  }
  return [];
}

function formatStatus(status: string) {
  const normalized = status?.toLowerCase() || "";
  switch (normalized) {
    case "pending": return "Pending";
    case "to_pickup": return "To Pick Up";
    case "picked_up": return "Picked Up";
    case "preparing": return "Preparing";
    case "to_deliver": return "To Deliver";
    case "delivered": return "Completed";
    case "completed": return "Completed";
    case "cancelled": return "Cancelled";
    default: return status?.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) || "Pending";
  }
}

function getStatusDisplay(status: string) {
  const normalized = status?.toLowerCase() || "";
  switch (normalized) {
    case "pending": return "Pending";
    case "to_pickup": return "To Pick Up";
    case "picked_up": return "Picked Up";
    case "preparing": return "Preparing";
    case "to_deliver": return "To Deliver";
    case "delivered": return "Completed";
    case "completed": return "Completed";
    case "cancelled": return "Cancelled";
    default: return status?.charAt(0).toUpperCase() + status?.slice(1) || "Pending";
  }
}

function getStatusColor(status: string) {
  const normalized = status?.toLowerCase() || "";
  switch (normalized) {
    case "pending": return "text-yellow-500";
    case "to_pickup": return "text-blue-600";
    case "picked_up": return "text-green-500";
    case "preparing": return "text-blue-600";
    case "to_deliver": return "text-blue-600";
    case "delivered": return "text-green-600";
    case "completed": return "text-green-600";
    case "cancelled": return "text-red-600";
    default: return "text-gray-500";
  }
}

function formatPaymentMethod(paymentMethod: string | undefined | null): string {
  if (!paymentMethod) return "Unknown";
  return paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1);
}

function canCancelOrder(order: any) {
  const status = order.status?.toLowerCase();
  return status === 'pending';
}

function cancelOrder(order: any) {
  orderToCancel.value = order;
  modalConfig.value = {
    title: 'Are you sure?',
    message: `You want to cancel order ${order.order_id}.`,
    type: 'warning',
    showCancel: true,
    confirmText: 'Yes, cancel it!',
    cancelText: 'No, keep it'
  };
  showConfirmModal.value = true;
}

async function handleConfirmCancel() {
  showConfirmModal.value = false;
  
  if (!orderToCancel.value) return;
  
  const order = orderToCancel.value;
  cancelLoading.value = order.order_id;

  try {
    const response = await axiosInstance.post(`/orders/${order.order_id}/cancel`);
    
    if (response.data.success) {
      // Update the order status locally
      const orderIndex = orders.value.findIndex(o => o.order_id === order.order_id);
      if (orderIndex !== -1) {
        orders.value[orderIndex].status = 'cancelled';
      }
      
      modalConfig.value = {
        title: 'Cancelled!',
        message: `Order ${order.order_id} has been cancelled successfully.`,
        type: 'success',
        showCancel: false,
        confirmText: 'OK',
        cancelText: ''
      };
      showResultModal.value = true;
    } else {
      modalConfig.value = {
        title: 'Error!',
        message: `Failed to cancel Order ${order.order_id}: ${response.data.message || 'Unknown error'}`,
        type: 'error',
        showCancel: false,
        confirmText: 'OK',
        cancelText: ''
      };
      showResultModal.value = true;
    }
  } catch (err: any) {
    console.error('Failed to cancel order:', err);
    const errorMessage = err.response?.data?.message || 'Failed to cancel order. Please try again.';
    
    modalConfig.value = {
      title: 'Error!',
      message: `Failed to cancel Order ${order.order_id}: ${errorMessage}`,
      type: 'error',
      showCancel: false,
      confirmText: 'OK',
      cancelText: ''
    };
    showResultModal.value = true;
  } finally {
    cancelLoading.value = null;
    orderToCancel.value = null;
  }
}

function handleCancelCancel() {
  showConfirmModal.value = false;
  orderToCancel.value = null;
}

function closeResultModal() {
  showResultModal.value = false;
}

function viewOrderDetails(order: any) {
  const statusMap: Record<string, string> = {
    'pending': 'pending',
    'to_pickup': 'to_pick_up',
    'picked_up': 'picked_up',
    'preparing': 'preparing',
    'to_deliver': 'to_deliver',
    'delivered': 'completed',
    'completed': 'completed',
    'cancelled': 'cancelled'
  };

  selectedOrder.value = {
    orderId: order.order_id?.toString(),
    status: statusMap[order.status?.toLowerCase()] || 'pending',
    pickUpDateTime: getDisplayDate(order),
    products: getAllProducts(order),
    totalAmount: parseFloat(order.total_price ?? 0),
    paymentMethod: order.payment_method || 'Unknown',
    paymentStatus: order.payment_status || 'unknown',
     deliveredAt: order.delivered_at || '',
    addressLabel: order.address_label || 'No label',
    fullAddress: order.full_address || 'No address'
  };
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
  selectedOrder.value = null;
}

onMounted(async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    await getProfile().catch(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/login");
    });

    const res = await axiosInstance.get("/orders");
    if (res.data.success) {
      orders.value = res.data.orders;
    } else {
      backendError.value = res.data.message || "Unable to load orders.";
    }
  } catch (err: any) {
    console.error("Failed to load orders:", err);
    backendError.value =
      err.response?.status === 401
        ? "Order history is temporarily unavailable due to a backend configuration issue."
        : "Failed to load orders. Please try again later.";
  } finally {
    loading.value = false;
  }
});

const filteredOrders = computed(() => {
  const query = search.value.trim().toLowerCase();
  if (!query) return orders.value;

  return orders.value.filter((o) => {
    const orderId = o.order_id?.toString().toLowerCase() || "";
    const status = formatStatus(o.status).toLowerCase();
    const total = o.total_price?.toString().toLowerCase() || "";
    const date = getDisplayDate(o).toLowerCase();
    const productNames = getProductNames(o).toLowerCase();
    const payment = formatPaymentMethod(o.payment_method).toLowerCase();

    return (
      orderId.includes(query) ||
      status.includes(query) ||
      total.includes(query) ||
      date.includes(query) ||
      productNames.includes(query) ||
      payment.includes(query)
    );
  });
});
</script>

<template>
  <CustomerLayout>
    <div class="p-4 sm:p-6 max-w-7xl mx-auto w-full">
      <h1 class="text-2xl sm:text-3xl font-bold mb-8 text-primary">Order</h1>

      <!-- Backend Error -->
      <div
        v-if="backendError"
        class="mb-4 p-4 bg-yellow-100 border border-yellow-400 rounded-lg"
      >
        <p class="text-yellow-800 text-sm">
          {{ backendError }}
        </p>
      </div>

      <!-- Search Bar -->
      <div class="mb-4">
        <input
          v-model="search"
          type="text"
          placeholder="Search orders..."
          class="w-full sm:w-1/3 px-4 py-2 ml-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          :disabled="!!backendError"
        />
      </div>

      <div class="hidden sm:block bg-white w-11/12 ml-12 shadow-md rounded-xl overflow-hidden">
        <div class="max-h-[calc(100vh-200px)] overflow-y-auto">
          <table class="w-full text-sm">
            <thead class="sticky top-0 bg-gray-50 z-10">
              <tr class="text-center border-b">
                <th class="py-3 px-4 font-semibold">Order ID</th>
                <th class="py-3 px-4 text-left font-semibold">Products</th>
                <th class="py-3 px-4 font-semibold">Total Amount</th>
                <th class="py-3 px-4 font-semibold">Date</th>
                <th class="py-3 px-4 font-semibold">Status</th>
                <th class="py-3 px-4 font-semibold">View Details</th>
                <th class="py-3 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              <!-- Loading -->
              <tr v-if="loading">
                <td colspan="7" class="text-center py-6">Loading orders...</td>
              </tr>

              <!-- Backend Error -->
              <tr v-else-if="backendError && orders.length === 0">
                <td colspan="7" class="text-center py-8">
                  <div class="flex flex-col items-center text-gray-500">
                    <svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                    </svg>
                    <p class="font-medium">Order History Temporarily Unavailable</p>
                    <p class="text-sm mt-1">We're working to resolve this issue.</p>
                  </div>
                </td>
              </tr>

              <!-- Empty -->
              <tr v-else-if="orders.length === 0">
                <td colspan="7" class="text-center py-6 text-gray-500">No orders found.</td>
              </tr>

              <!-- Data Rows -->
              <tr
                v-else
                v-for="order in filteredOrders"
                :key="order.order_id"
                class="border-t hover:bg-gray-50 text-center"
              >
                <td class="py-3 px-4">{{ order.order_id }}</td>
                <td class="py-3 px-4 text-left max-w-xs">
                  <div class="flex items-center flex-wrap space-x-1">
                    <span v-if="order.items?.length" class="text-sm">
                      {{ order.items[0].gallon_name || order.items[0].product_name || "Unknown Product" }} x{{ order.items[0].quantity || 1 }}
                    </span>
                    <span v-if="order.items.length > 1" class="text-xs text-gray-500">
                      +{{ order.items.length - 1 }} more
                    </span>
                  </div>
                </td>

                <td class="py-3 px-4">₱{{ order.total_price?.toFixed(2) }}</td>
                <td class="py-3 px-4">{{ formatDate(order.pickup_datetime) }}</td>
                <td
                  class="py-3 px-4 font-medium"
                  :class="getStatusColor(order.status)"
                >
                  {{ getStatusDisplay(order.status) }}
                </td>

                <!-- View Details Column -->
                <td class="py-3 px-4">
                  <button 
                    @click="viewOrderDetails(order)"
                    class="text-blue-600 underline hover:text-blue-800"
                  >
                    View Details
                  </button>
                </td>

                <!-- Actions Column -->
                <td class="py-3 px-4">
                  <button 
                    v-if="canCancelOrder(order)"
                    @click="cancelOrder(order)"
                    :disabled="cancelLoading === order.order_id"
                    class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600 text-sm font-medium"
                  >
                    {{ cancelLoading === order.order_id ? 'Cancelling...' : 'Cancel' }}
                  </button>
                  <span v-else class="text-gray-400">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Mobile View (Cards) -->
      <div class="sm:hidden space-y-4">
        <div v-if="loading" class="text-center py-6 text-gray-500">Loading orders...</div>

        <div v-else-if="backendError && orders.length === 0" class="text-center py-8 text-gray-500">
          <p class="font-medium">Order History Temporarily Unavailable</p>
          <p class="text-sm mt-1">We're working to resolve this issue.</p>
        </div>

        <div v-else-if="orders.length === 0" class="text-center py-6 text-gray-500">
          No orders found.
        </div>

        <div
          v-else
          v-for="order in filteredOrders"
          :key="order.order_id"
          class="bg-white shadow rounded-lg p-4 border border-gray-100"
        >
          <div class="flex justify-between items-center mb-2">
            <h2 class="font-semibold text-blue-800">Order {{ order.order_id }}</h2>
            <span
              class="text-sm font-medium"
              :class="getStatusColor(order.status)"
            >
              {{ getStatusDisplay(order.status) }}
            </span>
          </div>

          <div class="mb-2">
            <strong class="text-gray-700">Products:</strong>
            <div class="mt-1 space-y-1">
              <div v-for="(item, index) in order.items" :key="index" class="text-sm text-gray-700">
                • {{ item.gallon_name || item.product_name || "Unknown Product" }} x{{ item.quantity || 1 }}
              </div>
            </div>
          </div>
          
          <p class="text-gray-700"><strong>Total:</strong> ₱{{ order.total_price?.toFixed(2) }}</p>
          <p class="text-gray-700"><strong>Date:</strong> {{ formatDate(order.created_at) }}</p>
          <p class="text-gray-700"><strong>Payment:</strong> {{ formatPaymentMethod(order.payment_method) }}</p>

          <div class="mt-3 flex justify-between items-center">
            <button 
              @click="viewOrderDetails(order)"
              class="text-blue-600 underline hover:text-blue-800 text-sm"
            >
              View Details
            </button>

            <button 
              v-if="canCancelOrder(order)"
              @click="cancelOrder(order)"
              :disabled="cancelLoading === order.order_id"
              class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary text-sm font-medium"
            >
              {{ cancelLoading === order.order_id ? 'Cancelling...' : 'Cancel' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Details Modal -->
    <OrderDetailsModal
      v-if="selectedOrder"
      :order="selectedOrder"
      :isOpen="isModalOpen"
      @close="closeModal"
    />

    <!-- Confirm Cancel Modal -->
    <ConfirmModal
      :visible="showConfirmModal"
      :title="modalConfig.title"
      :message="modalConfig.message"
      :type="modalConfig.type"
      :show-cancel="modalConfig.showCancel"
      :confirm-text="modalConfig.confirmText"
      :cancel-text="modalConfig.cancelText"
      @confirm="handleConfirmCancel"
      @cancel="handleCancelCancel"
      @close="handleCancelCancel"
    />

    <!-- Result Modal (Success/Error) -->
    <ConfirmModal
      :visible="showResultModal"
      :title="modalConfig.title"
      :message="modalConfig.message"
      :type="modalConfig.type"
      :show-cancel="false"
      :confirm-text="modalConfig.confirmText"
      @confirm="closeResultModal"
      @close="closeResultModal"
    />
  </CustomerLayout>
</template>