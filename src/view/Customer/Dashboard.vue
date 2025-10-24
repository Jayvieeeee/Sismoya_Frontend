<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getProfile } from "@/utils/auth";
import CustomerLayout from "@/Layout/CustomerLayout.vue";
import axiosInstance from "@/utils/axios";
import { useRouter } from "vue-router";
import GallonImg from '@/assets/images/Dashboard_img.png'
import OrderDetailsModal from "@/components/OrderDetailsModal.vue";

const router = useRouter();

interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  contact_no: string;
  role: string;
}

interface DashboardStats {
  pending: number;
  completed: number;
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
  completed: 0,
  cancelled: 0,
  total: 0,
});
const latestOrders = ref<LatestOrder[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

// Modal state
const isModalOpen = ref(false);
const selectedOrder = ref<any>(null);

// Helpers
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount);
};

const getStatusColor = (status: string) => {
  const s = status.toLowerCase();
  if (s === "completed") return "text-green-600";
  if (s === "pending") return "text-yellow-600";
  if (s === "cancelled") return "text-red-600";
  if (s === "to pick up" || s === "to deliver") return "text-blue-600";
  return "text-gray-600";
};

// UPDATED: Better order items formatting
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

// Open modal with order details
const viewOrderDetails = (order: LatestOrder) => {
  selectedOrder.value = {
    order_id: order.id.toString(),
    status: order.status,
    pickUpDateTime: formatDate(order.created_at),
    gallonType: "Round Gallon",
    quantity: 1,
    totalAmount: order.total_amount,
    paymentMethod: "Cash",
    imageUrl: undefined
  };
  isModalOpen.value = true;
};

// Close modal
const closeModal = () => {
  isModalOpen.value = false;
  selectedOrder.value = null;
};

// Compute stats from user orders - FIXED STATUS FILTERING
const computeStatsFromOrders = async (userOrders: UserOrder[]) => {
  

  const pending = userOrders.filter((o) => 
    o.status.toLowerCase() === "pending" || 
    o.status.toLowerCase() === "to pick up" || 
    o.status.toLowerCase() === "to deliver"
  ).length;
  
  const completed = userOrders.filter((o) => 
    o.status.toLowerCase() === "completed"
  ).length;
  
  const cancelled = userOrders.filter((o) => 
    o.status.toLowerCase() === "cancelled"
  ).length;

  stats.value = {
    pending,
    completed,
    cancelled,
    total: userOrders.length,
  };
};

// error handling
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

// UPDATED: Fallback local stats with proper status filtering
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
              `${item.quantity}x ${item.gallon_name || 'Round Gallon'}`
            ).join(', ') : 'Round Gallon'
        }));

      error.value = null;
    }
  } catch (fallbackErr) {
    error.value = "Unable to load dashboard data. Please try again later.";
  }
};

// UPDATED: Fixed dashboard data fetching
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
      latestOrders.value = latestResponse.data.data.map((order: any) => ({
        id: order.order_id,
        total_amount: order.total_price,
        status: order.status,
        created_at: order.created_at,
        order_items: order.order_items,
        items: order.items
      }));
    } else {
      latestOrders.value = userOrders
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
            ).join(', ') : 'Round Gallon'
        }));
    }

  } catch (err: any) {
    await handleDashboardError(err);
  } finally {
    loading.value = false;
  }
};

// Navigation
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
            <p class="text-lg my-4 font-semibold">
              Welcome,
              <span v-if="user">
                {{ user.first_name }} {{ user.last_name }}
              </span>
            </p>

            <!-- GALLON IMG HERE - COMPACT -->
            <div class="mb-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-4 shadow-lg">
              <div class="flex justify-center items-center">
                <img 
                  :src="GallonImg" 
                  alt="Sismoya Water Gallon" 
                  class="max-w-[200px] md:max-w-[250px] transform hover:scale-105 transition duration-300">
              </div>
            </div>

            <!-- Stats - COMPACT -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div class="bg-white shadow rounded-xl p-6 text-center hover:shadow-lg transition">
                <p class="text-xl font-bold text-yellow-600">{{ stats.pending }}</p>
                <p class="text-gray-500 text-sm font-medium">Pending Orders</p>
              </div>
              <div class="bg-white shadow rounded-xl p-6 text-center hover:shadow-lg transition">
                <p class="text-xl font-bold text-green-600">{{ stats.completed }}</p>
                <p class="text-gray-500 text-sm font-medium">Completed Orders</p>
              </div>
              <div class="bg-white shadow rounded-xl p-6 text-center hover:shadow-lg transition">
                <p class="text-xl font-bold text-red-600">{{ stats.cancelled }}</p>
                <p class="text-gray-500 text-sm font-medium">Cancelled Orders</p>
              </div>
              <div class="bg-white shadow rounded-xl p-6 text-center hover:shadow-lg transition">
                <p class="text-xl font-bold text-blue-600">{{ stats.total }}</p>
                <p class="text-gray-500 text-sm font-medium">Total Orders</p>
              </div>
            </div>

            <!-- Recent Orders - FIT CONTENT -->
            <div class="bg-white shadow rounded-xl p-4">
              <div class="flex justify-between items-center mb-3">
                <h2 class="text-lg font-bold text-gray-800">Recent Orders</h2>
                <button
                  @click="viewAllOrders"
                  class="text-blue-600 hover:text-blue-800 font-medium text-sm transition"
                >
                  View All Orders →
                </button>
              </div>

              <div
                v-if="latestOrders.length === 0"
                class="text-center py-8 text-gray-500"
              >
                No orders found.
              </div>

              <!-- TABLE FIT CONTENT -->
              <div v-else>
                <table class="w-full text-left border-collapse text-sm">
                  <thead class="bg-gray-50">
                    <tr class="border-b">
                      <th class="py-2 px-3 font-semibold text-gray-700 whitespace-nowrap">Order ID</th>
                      <th class="py-2 px-3 font-semibold text-gray-700 whitespace-nowrap">Order Items</th>
                      <th class="py-2 px-3 font-semibold text-gray-700 whitespace-nowrap">Total Amount</th>
                      <th class="py-2 px-3 font-semibold text-gray-700 whitespace-nowrap">Date</th>
                      <th class="py-2 px-3 font-semibold text-gray-700 whitespace-nowrap">Status</th>
                      <th class="py-2 px-3 font-semibold text-gray-700 whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="order in latestOrders"
                      :key="order.id"
                      class="border-b hover:bg-gray-50 transition"
                    >
                      <td class="py-2 px-3 font-medium whitespace-nowrap">#{{ order.id }}</td>
                      <td class="py-2 px-3 whitespace-nowrap">{{ formatOrderItems(order) }}</td>
                      <td class="py-2 px-3 font-medium whitespace-nowrap">
                        {{ formatCurrency(order.total_amount) }}
                      </td>
                      <td class="py-2 px-3 whitespace-nowrap">{{ formatDate(order.created_at) }}</td>
                      <td class="py-2 px-3 font-medium whitespace-nowrap" :class="getStatusColor(order.status)">
                        {{ order.status }}
                      </td>
                      <td class="py-2 px-3 whitespace-nowrap">
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