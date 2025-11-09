<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { getProfile } from "@/utils/auth";
import CustomerLayout from "@/Layout/CustomerLayout.vue";
import axiosInstance from "@/utils/axios";
import { useRouter } from "vue-router";
import OrderDetailsModal from "@/components/OrderDetailsModal.vue";
import { CheckIcon } from '@heroicons/vue/24/outline';

const router = useRouter();

interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  contact_no: string;
  role: string;
  email_verified_at: string | null;
  is_verified?: boolean;
}

interface DashboardStats {
  pending: number;
  delivered: number;
  cancelled: number;
  total: number;
}

interface LatestOrder {
  id: number;
  total_amount: number;
  status: string;
  created_at: string;
  order_items: string;
  items?: any[];
  payment_method?: string;
  payment_status?: string; 
}

interface UserOrder {
  order_id: number;
  total_price: number;
  status: string;
  created_at: string;
  items?: any[];
}

// Reactive data
const user = ref<User | null>(null);
const stats = ref<DashboardStats>({
  pending: 0,
  delivered: 0,
  cancelled: 0,
  total: 0,
});
const latestOrders = ref<LatestOrder[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

// Modal state
const isModalOpen = ref(false);
const selectedOrder = ref<any>(null);

// Upcoming order (next scheduled order)
const upcomingOrder = ref<LatestOrder | null>(null);

// Ongoing order (current order in progress)
const ongoingOrder = ref<LatestOrder | null>(null);

// Status tracking
const statusList = ['Pending', 'To Pick Up', 'Preparing', 'To Deliver', 'Completed'];

const statusMap: Record<string, string> = {
  'pending': 'Pending',
  'to_pickup': 'To Pick Up',
  'to_pick_up': 'To Pick Up',
  'picked_up': 'To Pick Up',
  'picked up': 'To Pick Up',
  'preparing': 'Preparing',
  'to_deliver': 'To Deliver',
  'delivered': 'Completed',
  'completed': 'Completed',
  'cancelled': 'Cancelled'
};

function getDisplayStatus(backendStatus: string): string {
  return statusMap[backendStatus.toLowerCase()] || 'Pending';
}

function isActiveStatus(status: string, orderStatus: string) {
  const displayOrderStatus = getDisplayStatus(orderStatus);
  const statusIndex = statusList.indexOf(status);
  const orderStatusIndex = statusList.indexOf(displayOrderStatus);
  return statusIndex <= orderStatusIndex;
}

function getProgressLineBottom(orderStatus: string) {
  const displayOrderStatus = getDisplayStatus(orderStatus);
  const currentIndex = statusList.indexOf(displayOrderStatus);
  
  if (currentIndex === -1) return '100%';
  
  const progressPercentage = (currentIndex / (statusList.length - 1)) * 100;
  
  return `${100 - progressPercentage}%`;
}

// Helpers
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount);
};

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

// Format the status text for display
const formatStatus = (status: string) => {
  const formatted: { [key: string]: string } = {
    pending: "Pending",
    to_pickup: "To Pickup", 
    to_pick_up: "To Pick Up",
    picked_up: "Picked Up",
    "picked up": "Picked Up",
    preparing: "Preparing",
    to_deliver: "To Deliver",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  
  return formatted[status.toLowerCase()] || status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Better order items formatting
const formatOrderItems = (order: LatestOrder) => {
  if (order.order_items) {
    return order.order_items;
  }
  
  if (order.items && Array.isArray(order.items)) {
    return order.items.map(item => 
      `${item.quantity}x ${item.gallon_name || 'Item'}`
    ).join(', ');
  }
  
  return "No items";
};

const viewOrderDetails = (order: LatestOrder) => {
  let gallonType = "Round Gallon";
  let quantity = 1;
  let imageUrl = undefined;
  let paymentMethod = "Cash";
  let paymentStatus = "unpaid";

  if (order.items && Array.isArray(order.items) && order.items.length > 0) {
    const firstItem = order.items[0];
    gallonType = firstItem.gallon_name || firstItem.product_name || "Round Gallon";
    quantity = firstItem.quantity || 1;
    imageUrl = firstItem.gallon_image || undefined;
    paymentMethod = firstItem.payment_method || order.payment_method || "Cash";
    paymentStatus = order.payment_status || "unpaid";
  } else if (order.order_items) {
    const match = order.order_items.match(/(\d+)x\s*(.+)/);
    if (match) {
      quantity = parseInt(match[1]) || 1;
      gallonType = match[2].trim() || "Round Gallon";
    }
    paymentMethod = order.payment_method || "Cash";
    paymentStatus = order.payment_status || "unpaid";
  }

  const formatPaymentStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'unpaid': 'Unpaid',
      'paid': 'Paid',
      'pending': 'Pending',
      'failed': 'Failed',
      'refunded': 'Refunded'
    };
    return statusMap[status.toLowerCase()] || status.charAt(0).toUpperCase() + status.slice(1);
  };

  selectedOrder.value = {
    orderId: order.id?.toString() ?? "N/A",
    status: order.status,
    pickUpDateTime: formatDate(order.created_at), 
    gallonType: gallonType,
    quantity: quantity,
    totalAmount: parseFloat(order.total_amount?.toString() ?? "0"),
    paymentMethod: paymentMethod,
    paymentStatus: formatPaymentStatus(paymentStatus),
    imageUrl: imageUrl,
  };
  
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedOrder.value = null;
};

const computeStatsFromOrders = async (userOrders: UserOrder[]) => {
  const pending = userOrders.filter((o) => 
    o.status.toLowerCase() === "pending" || 
    o.status.toLowerCase() === "to pick up" || 
    o.status.toLowerCase() === "to deliver"
  ).length;
  
  const delivered = userOrders.filter((o) => 
    o.status.toLowerCase() === "delivered"
  ).length;

  const cancelled = userOrders.filter((o) => 
    o.status.toLowerCase() === "cancelled"
  ).length;

  stats.value = {
    pending,
    delivered,
    cancelled,
    total: userOrders.length,
  };
};

const handleDashboardError = async (err: any) => {
  if (err.response?.status === 401) {
    error.value = "Please login again to view your dashboard";
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  } else if (err.response?.status === 422) {
    await fallbackToLocalStats();
  } else if (err.response?.status === 404) {
    error.value = "Dashboard features are not available yet.";
  } else if (err.response?.status === 500) {
    error.value = "Server error. Please try again later.";
  } else {
    error.value = err.response?.data?.message || "Failed to load dashboard data";
  }
};

const fallbackToLocalStats = async () => {
  try {
    const profile = await getProfile();
    if (!profile?.user_id) return;

    const ordersResponse = await axiosInstance.get("/orders", {
      params: { user_id: profile.user_id },
    });

    if (ordersResponse.data?.success && Array.isArray(ordersResponse.data.orders)) {
      const userOrders: UserOrder[] = ordersResponse.data.orders;
      
      await computeStatsFromOrders(userOrders);

      latestOrders.value = userOrders
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3)
        .map((order) => ({
          id: order.order_id,
          total_amount: order.total_price,
          status: order.status,
          created_at: order.created_at,
          order_items: order.items ? 
            order.items.map((item: any) => 
              `${item.quantity}x ${item.gallon_name}`
            ).join(', ') : 'Round Gallon',
          items: order.items
        }));

      error.value = null;
    }
  } catch (fallbackErr) {
    error.value = "Unable to load dashboard data. Please try again later.";
  }
};

const fetchDashboardData = async () => {
  try {
    loading.value = true;
    error.value = null;

    const profile = await getProfile();
    user.value = profile;

    if (!user.value?.user_id) {
      throw new Error("User not authenticated");
    }

    const ordersResponse = await axiosInstance.get("/orders", {
      params: { user_id: user.value.user_id },
    });

    if (!ordersResponse.data?.success || !Array.isArray(ordersResponse.data.orders)) {
      throw new Error("Failed to fetch user orders");
    }

    const userOrders: UserOrder[] = ordersResponse.data.orders;

    const statsResponse = await axiosInstance.get("/orders/stats", {
      params: { user_id: user.value.user_id }
    });

    if (statsResponse.data?.success) {
      stats.value = statsResponse.data.data;
    } else {
      await computeStatsFromOrders(userOrders);
    }

    const latestResponse = await axiosInstance.get("/orders/latest", {
      params: { user_id: user.value.user_id, limit: 5 },
    });

    if (latestResponse.data?.success && Array.isArray(latestResponse.data.data)) {
      const orders = latestResponse.data.data.map((order: any) => ({
        id: order.order_id,
        total_amount: order.total_price,
        status: order.status,
        created_at: order.created_at,
        order_items: order.order_items,
        items: order.items, 
        payment_method: order.payment_method, 
        payment_status: order.payment_status
      }));
      
      latestOrders.value = orders;
      
      // Find ongoing order (not completed or cancelled)
      ongoingOrder.value = orders.find((order: LatestOrder) => 
        !['completed', 'delivered', 'cancelled'].includes(order.status.toLowerCase())
      ) || null;
      
      // Find upcoming order (pending status, most recent)
      upcomingOrder.value = orders.find((order: LatestOrder) => 
        order.status.toLowerCase() === 'pending'
      ) || null;
      
    } else {
      const orders = userOrders
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3)
        .map(order => ({
          id: order.order_id,
          total_amount: order.total_price,
          status: order.status,
          created_at: order.created_at,
          order_items: order.items ? 
            order.items.map((item: any) => 
              `${item.quantity}x ${item.gallon_name || 'Round Gallon'}`
            ).join(', ') : 'Round Gallon',
          items: order.items 
        }));
      
      latestOrders.value = orders;
      
      ongoingOrder.value = orders.find((order: LatestOrder) => 
        !['completed', 'delivered', 'cancelled'].includes(order.status.toLowerCase())
      ) || null;
      
      upcomingOrder.value = orders.find((order: LatestOrder) => 
        order.status.toLowerCase() === 'pending'
      ) || null;
    }

  } catch (err: any) {
    await handleDashboardError(err);
  } finally {
    loading.value = false;
  }
};

const viewAllOrders = () => router.push("/orderHistory");
const retryLoad = () => fetchDashboardData();

onMounted(() => fetchDashboardData());
</script>

<template>
  <CustomerLayout>
    <div class="flex font-montserrat">
      <div class="flex-1">
        <div class="p-4 mx-6">
          <div v-if="loading" class="text-center py-8">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p class="text-gray-600 mt-2">Loading dashboard data...</p>
          </div>

          <div
            v-else-if="error"
            class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4"
          >
            <p class="font-semibold">Unable to load dashboard</p>
            <p class="mt-1 text-sm">{{ error }}</p>
            <button
              @click="retryLoad"
              class="mt-3 bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition text-sm"
            >
              Try Again
            </button>
          </div>

          <div v-else>
            <!-- Welcome Section -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
              <p class="text-lg font-semibold">
                Welcome,
                <span v-if="user">
                  {{ user.first_name }} {{ user.last_name }}
                </span>
              </p>
            </div>

            <!-- Stats Cards - Made more compact -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              <div class="bg-white shadow rounded-lg p-4 text-center hover:shadow-md transition">
                <p class="text-lg font-bold text-yellow-600">{{ stats.pending }}</p>
                <p class="text-gray-500 text-sm font-medium">Pending Orders</p>
              </div>
              <div class="bg-white shadow rounded-lg p-4 text-center hover:shadow-md transition">
                <p class="text-lg font-bold text-green-600">{{ stats.delivered }}</p>
                <p class="text-gray-500 text-sm font-medium">Completed Orders</p>
              </div>
              <div class="bg-white shadow rounded-lg p-4 text-center hover:shadow-md transition">
                <p class="text-lg font-bold text-blue-600">{{ stats.total }}</p>
                <p class="text-gray-500 text-sm font-medium">Total Orders</p>
              </div>
            </div>

            <!-- Two Column Layout: Upcoming Order + Order Status - Made more compact -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
              <!-- Left: Upcoming Order - Made more compact -->
              <div class="bg-white shadow rounded-lg p-4">
                <h3 class="text-md font-bold text-gray-800 mb-3">Upcoming Order</h3>
                
                <div v-if="!upcomingOrder" class="text-center py-4 text-gray-500 text-sm">
                  No upcoming orders
                </div>
                
                <div v-else class="space-y-2">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Order ID:</span>
                    <span class="font-semibold text-sm">{{ upcomingOrder.id }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Items:</span>
                    <span class="font-medium text-sm truncate max-w-[150px]">{{ formatOrderItems(upcomingOrder) }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Total Amount:</span>
                    <span class="font-semibold text-green-600 text-sm">{{ formatCurrency(upcomingOrder.total_amount) }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Scheduled:</span>
                    <span class="text-sm">{{ formatDate(upcomingOrder.created_at) }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Status:</span>
                    <span class="font-medium text-sm" :class="getStatusColor(upcomingOrder.status)">
                      {{ formatStatus(upcomingOrder.status) }}
                    </span>
                  </div>
                  <button
                    @click="viewOrderDetails(upcomingOrder)"
                    class="w-full mt-2 bg-primary text-white py-1.5 rounded text-sm hover:bg-secondary transition"
                  >
                    View Details
                  </button>
                </div>
              </div>

              <!-- Right: Order Status Tracker - Made more compact -->
              <div class="bg-white shadow rounded-lg p-4">
                <h3 class="text-md font-bold text-gray-800 mb-3">Current Order Status</h3>
                
                <div v-if="!ongoingOrder" class="text-center py-4 text-gray-500 text-sm">
                  No ongoing orders
                </div>
                
                <div v-else class="space-y-3">
                  <!-- Order Info - More compact -->
                  <div class="rounded p-2 mb-2">
                    <div class="flex justify-between items-center mb-1">
                      <span class="text-sm ">Order #{{ ongoingOrder.id }}</span>
                      <span class="text-sm font-semibold text-green-600">{{ formatCurrency(ongoingOrder.total_amount) }}</span>
                    </div>
                    <p class="text-sm truncate">{{ formatOrderItems(ongoingOrder) }}</p>
                  </div>

                  <!-- Horizontal Status Tracker - More compact -->
                  <div class="relative flex flex-col items-center">
                    <!-- Status Line (behind circles) -->
                    <div class="absolute top-3 left-12 right-12 h-0.5 bg-gray-300 z-0"></div>

                    <!-- Progress Line (behind circles) -->
                    <div
                      class="absolute top-3 left-12 right-12 h-0.5 bg-green-500 transition-all duration-500 z-0"
                      :style="{ width: ((statusList.indexOf(getDisplayStatus(ongoingOrder.status)) / (statusList.length - 1)) * 100) + '%' }"
                    ></div>

                    <!-- Circles + Labels - More compact -->
                    <div class="flex justify-between w-full px-2 relative z-10">
                      <div
                        v-for="status in statusList"
                        :key="status"
                        class="flex flex-col items-center text-center flex-1"
                      >
                        <!-- Circle -->
                        <div
                          :class="[
                            'w-6 h-6 rounded-full flex items-center justify-center border-2 mb-1 transition-all shadow-sm',
                            isActiveStatus(status, ongoingOrder.status)
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'bg-white border-gray-300 text-gray-400'
                          ]"
                        >
                          <CheckIcon
                            v-if="isActiveStatus(status, ongoingOrder.status)"
                            class="w-3 h-3 stroke-[3]"
                          />
                        </div>

                        <!-- Label -->
                        <span
                          :class="[
                            'font-semibold text-[10px] whitespace-nowrap',
                            isActiveStatus(status, ongoingOrder.status)
                              ? 'text-gray-900'
                              : 'text-gray-400'
                          ]"
                        >
                          {{ status }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Recent Orders Table - Made more compact -->
            <div class="bg-white shadow rounded-lg p-1">
              <div class="flex justify-between items-center mb-2">
                <h2 class="text-md font-bold text-gray-800">Recent Orders</h2>
                <button
                  @click="viewAllOrders"
                  class="text-blue-600 hover:text-blue-800 font-medium text-xs transition"
                >
                  View All Orders →
                </button>
              </div>

              <div
                v-if="latestOrders.length === 0"
                class="text-center py-4 text-gray-500 text-base"
              >
                No orders found.
              </div>

              <div v-else>
                <table class="w-full text-left border-collapse text-xs">
                  <thead class="bg-gray-50">
                    <tr class="border-b text-base">
                      <th class="py-2 px-2 font-semibold text-gray-700 whitespace-nowrap">Order ID</th>
                      <th class="py-2 px-2 font-semibold text-gray-700 whitespace-nowrap">Order Items</th>
                      <th class="py-2 px-2 font-semibold text-gray-700 whitespace-nowrap">Total Amount</th>
                      <th class="py-2 px-2 font-semibold text-gray-700 whitespace-nowrap">Date</th>
                      <th class="py-2 px-2 font-semibold text-gray-700 whitespace-nowrap">Status</th>
                      <th class="py-2 px-2 font-semibold text-gray-700 whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="order in latestOrders"
                      :key="order.id"
                      class="border-b hover:bg-gray-50 transition text-base"
                    >
                      <td class="py-2 px-2 font-medium whitespace-nowrap">{{ order.id }}</td>
                      <td class="py-2 px-2 whitespace-nowrap truncate max-w-[120px]">{{ formatOrderItems(order) }}</td>
                      <td class="py-2 px-2 font-medium whitespace-nowrap">
                        {{ formatCurrency(order.total_amount) }}
                      </td>
                      <td class="py-2 px-2 whitespace-nowrap">{{ formatDate(order.created_at) }}</td>
                      <td class="py-2 px-2 whitespace-nowrap" :class="getStatusColor(order.status)">
                        {{ formatStatus(order.status) }}
                      </td>
                      <td class="py-2 px-2 whitespace-nowrap">
                        <button
                          @click="viewOrderDetails(order)"
                          class="text-blue-500 hover:text-blue-700 font-medium cursor-pointer transition"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
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
  </CustomerLayout>
</template>