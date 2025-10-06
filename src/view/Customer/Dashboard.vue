<script setup lang="ts">
import { ref, onMounted } from "vue";
import gallonImg from "@/assets/images/Dashboard_img.png";
import { getProfile } from "@/utils/auth";
import CustomerLayout from "@/Layout/CustomerLayout.vue";
import axiosInstance from "@/utils/axios";
import { useRouter } from "vue-router";

const router = useRouter();

// Interfaces
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
}

interface UserOrder {
  order_id: number;
  total_price: number;
  status: string;
  created_at: string;
}

// Reactive data
const user = ref<User | null>(null);
const stats = ref<DashboardStats>({
  pending: 0,
  completed: 0,
  cancelled: 0,
  total: 0
});
const latestOrders = ref<LatestOrder[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

// Format date function
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// Format currency function
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP'
  }).format(amount);
};

// Get status color
const getStatusColor = (status: string) => {
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case 'completed':
      return 'text-green-600';
    case 'pending':
      return 'text-yellow-600';
    case 'cancelled':
      return 'text-red-600';
    case 'to pick up':
    case 'to deliver':
      return 'text-blue-600';
    default:
      return 'text-gray-600';
  }
};

// Format order items for display
const formatOrderItems = (order: LatestOrder) => {
  return order.order_items || "No items";
};

// Fetch user's orders first to get order IDs, then fetch dashboard data
const fetchDashboardData = async () => {
  try {
    loading.value = true;
    error.value = null;

    // Fetch user profile
    const profile = await getProfile();
    user.value = profile;

    console.log('📊 Fetching dashboard data...');
    console.log('👤 Current user:', user.value);

    if (!user.value?.user_id) {
      throw new Error("User not authenticated");
    }

    // Step 1: First get the user's orders to have order IDs
    console.log('🔄 Step 1: Fetching user orders...');
    const ordersResponse = await axiosInstance.get("/orders", {
      params: { user_id: user.value.user_id }
    });

    console.log('📋 User orders response:', ordersResponse.data);

    if (!ordersResponse.data?.success || !Array.isArray(ordersResponse.data.orders)) {
      throw new Error("Failed to fetch user orders");
    }

    const userOrders: UserOrder[] = ordersResponse.data.orders;
    
    if (userOrders.length === 0) {
      // No orders yet, set empty state
      console.log('📭 No orders found for user');
      stats.value = { pending: 0, completed: 0, cancelled: 0, total: 0 };
      latestOrders.value = [];
      return;
    }

    // Get the most recent order ID for dashboard endpoints
    const mostRecentOrder = userOrders[0]; // Assuming orders are sorted by date
    const recentOrderId = mostRecentOrder.order_id;

    console.log('🎯 Using order_id for dashboard requests:', recentOrderId);

    // Step 2: Fetch stats using an order_id
    console.log('🔄 Step 2: Fetching stats...');
    const statsResponse = await axiosInstance.get("/orders/stats", {
      params: { 
        user_id: user.value.user_id,
        order_id: recentOrderId 
      }
    });
    
    console.log('📈 Stats API Response:', statsResponse.data);
    
    if (statsResponse.data?.success) {
      stats.value = statsResponse.data.data;
      console.log('✅ Stats loaded:', stats.value);
    } else {
      throw new Error("Failed to fetch dashboard stats");
    }

    // Step 3: Fetch latest orders using an order_id
    console.log('🔄 Step 3: Fetching latest orders...');
    const latestResponse = await axiosInstance.get("/orders/latest", {
      params: { 
        user_id: user.value.user_id,
        order_id: recentOrderId 
      }
    });
    
    console.log('📋 Latest Orders API Response:', latestResponse.data);
    
    if (latestResponse.data?.success) {
      latestOrders.value = latestResponse.data.data;
      console.log('✅ Latest orders loaded:', latestOrders.value);
    } else {
      throw new Error("Failed to fetch latest orders");
    }

    console.log('✅ Dashboard data loaded successfully');

  } catch (err: any) {
    console.error("Dashboard data load failed:", err);
    console.error("Full error:", err);
    console.error("Error response data:", err.response?.data);
    
    if (err.response?.status === 401) {
      error.value = "Please login again to view your dashboard";
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/login");
    } else if (err.response?.status === 422) {
      // If still getting 422, fall back to computing stats locally
      console.log('🔄 Falling back to local stats computation');
      await fallbackToLocalStats();
    } else if (err.response?.status === 404) {
      error.value = "Dashboard features are not available yet.";
    } else if (err.response?.status === 500) {
      error.value = "Server error. Please try again later.";
    } else {
      error.value = err.response?.data?.message || "Failed to load dashboard data";
    }
  } finally {
    loading.value = false;
  }
};

// Fallback method: Compute stats locally from user's orders
const fallbackToLocalStats = async () => {
  try {
    console.log('🔄 Fallback: Computing stats locally...');
    
    const profile = await getProfile();
    if (!profile?.user_id) return;

    const ordersResponse = await axiosInstance.get("/orders", {
      params: { user_id: profile.user_id }
    });

    if (ordersResponse.data?.success && Array.isArray(ordersResponse.data.orders)) {
      const userOrders: UserOrder[] = ordersResponse.data.orders;
      
      // Compute stats locally with proper typing
      const pending_orders = userOrders.filter((order: UserOrder) => 
        order.status === 'Pending' || order.status === 'To Pick Up' || order.status === 'To Deliver'
      ).length;
      
      const completed_orders = userOrders.filter((order: UserOrder) => 
        order.status === 'Completed'
      ).length;
      
      const cancelled_orders = userOrders.filter((order: UserOrder) => 
        order.status === 'Cancelled'
      ).length;
      
      const total_orders = userOrders.length;

      stats.value = {
        pending: pending_orders,
        completed: completed_orders,
        cancelled: cancelled_orders,
        total: total_orders
      };

      // Get latest 3 orders with proper typing
      latestOrders.value = userOrders
        .sort((a: UserOrder, b: UserOrder) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3)
        .map((order: UserOrder) => ({
          id: order.order_id,
          total_amount: order.total_price,
          status: order.status,
          created_at: order.created_at,
          order_items: "Round Gallon" // Fallback since we don't have item details
        }));

      console.log('✅ Local stats computed:', stats.value);
      error.value = null;
    }
  } catch (fallbackErr) {
    console.error('❌ Fallback also failed:', fallbackErr);
    error.value = "Unable to load dashboard data. Please try again later.";
  }
};

// View order details function
const viewOrderDetails = (orderId: number) => {
  console.log('🔍 Viewing order details:', orderId);
  router.push(`/orders/${orderId}`);
};

// View all orders
const viewAllOrders = () => {
  router.push('/orderHistory');
};

// Retry loading data
const retryLoad = () => {
  fetchDashboardData();
};

onMounted(() => {
  fetchDashboardData();
});
</script>

<template>
  <CustomerLayout>
    <div class="flex font-montserrat bg-gradient-to-b from-white to-secondary min-h-screen">
      <!-- Main Content -->
      <div class="flex-1 p-6 mx-12">
        <!-- Title -->
        <h1 class="text-3xl font-bold text-primary mb-4">Sismoya Water</h1>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p class="text-gray-600 mt-2">Loading dashboard data...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <p class="font-semibold">Unable to load dashboard</p>
          <p class="mt-1 text-sm">{{ error }}</p>
          <button 
            @click="retryLoad" 
            class="mt-3 bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition text-sm"
          >
            Try Again
          </button>
        </div>

        <!-- Main Content -->
        <div v-else>
          <!-- Welcome message -->
          <p class="text-lg mb-6 font-semibold">
            Welcome,
            <span v-if="user" class="text-primary"> 
              {{ user.first_name }} {{ user.last_name }} 
            </span>
          </p>

          <!-- Gallon Image in White Box -->
          <div class="bg-white rounded-xl shadow-md flex justify-center items-center p-6 mb-8">
            <img :src="gallonImg" alt="Water Gallons" class="h-48 object-contain" />
          </div>

          <!-- Stats Section -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-white shadow rounded-xl p-6 text-center hover:shadow-lg transition">
              <p class="text-2xl font-bold text-yellow-600">{{ stats.pending }}</p>
              <p class="text-gray-500 font-medium">Pending Orders</p>
            </div>
            <div class="bg-white shadow rounded-xl p-6 text-center hover:shadow-lg transition">
              <p class="text-2xl font-bold text-green-600">{{ stats.completed }}</p>
              <p class="text-gray-500 font-medium">Completed Orders</p>
            </div>
            <div class="bg-white shadow rounded-xl p-6 text-center hover:shadow-lg transition">
              <p class="text-2xl font-bold text-red-600">{{ stats.cancelled }}</p>
              <p class="text-gray-500 font-medium">Cancelled Orders</p>
            </div>
            <div class="bg-white shadow rounded-xl p-6 text-center hover:shadow-lg transition">
              <p class="text-2xl font-bold text-blue-600">{{ stats.total }}</p>
              <p class="text-gray-500 font-medium">Total Orders</p>
            </div>
          </div>

          <!-- Recent Orders Section -->
          <div class="bg-white shadow rounded-xl p-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-bold text-gray-800">Recent Orders</h2>
              <button 
                @click="viewAllOrders"
                class="text-blue-600 hover:text-blue-800 font-medium text-sm transition"
              >
                View All Orders →
              </button>
            </div>
            
            <div v-if="latestOrders.length === 0" class="text-center py-8 text-gray-500">
              No orders found. <router-link to="/products" class="text-blue-600 hover:underline">Start shopping</router-link>
            </div>
            
            <div v-else class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b bg-gray-50">
                    <th class="py-3 px-4 font-semibold text-gray-700">Order ID</th>
                    <th class="py-3 px-4 font-semibold text-gray-700">Order Items</th>
                    <th class="py-3 px-4 font-semibold text-gray-700">Total Amount</th>
                    <th class="py-3 px-4 font-semibold text-gray-700">Date</th>
                    <th class="py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th class="py-3 px-4 font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="order in latestOrders" 
                    :key="order.id" 
                    class="border-b hover:bg-gray-50 transition"
                  >
                    <td class="py-3 px-4 font-medium">#{{ order.id }}</td>
                    <td class="py-3 px-4">
                      {{ formatOrderItems(order) }}
                    </td>
                    <td class="py-3 px-4 font-medium">
                      {{ formatCurrency(order.total_amount) }}
                    </td>
                    <td class="py-3 px-4">{{ formatDate(order.created_at) }}</td>
                    <td class="py-3 px-4 font-medium" :class="getStatusColor(order.status)">
                      {{ order.status }}
                    </td>
                    <td class="py-3 px-4">
                      <button 
                        @click="viewOrderDetails(order.id)"
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
  </CustomerLayout>
</template>