<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
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

interface Order {
  order_id: number;
  total_price: number;
  created_at: string;
  status: string;
}

// Reactive data
const user = ref<User | null>(null);
const orders = ref<Order[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

// Computed stats from orders
const stats = computed(() => {
  const pending_orders = orders.value.filter(order => 
    order.status === 'Pending' || order.status === 'To Pick Up' || order.status === 'To Deliver'
  ).length;
  
  const completed_orders = orders.value.filter(order => 
    order.status === 'Completed'
  ).length;
  
  const cancelled_orders = orders.value.filter(order => 
    order.status === 'Cancelled'
  ).length;
  
  const total_orders = orders.value.length;

  return {
    pending_orders,
    completed_orders,
    cancelled_orders,
    total_orders
  };
});

// Latest orders (most recent 3)
const latestOrders = computed(() => {
  return [...orders.value]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);
});

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
  switch (status.toLowerCase()) {
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

// Format order items for display (based on your order history)
const formatOrderItems = (order: Order) => {
  // Since your order history shows "Round Gallon", we'll use that
  // You might want to update this if you have actual item data
  return "Round Gallon";
};

// Fetch dashboard data
const fetchDashboardData = async () => {
  try {
    loading.value = true;
    error.value = null;

    // Fetch user profile
    const profile = await getProfile();
    user.value = profile;

    // Fetch orders (using the same endpoint as your order history)
    const response = await axiosInstance.get("/orders");
    if (response.data?.success) {
      orders.value = response.data.orders;
    } else {
      throw new Error("Failed to fetch orders");
    }

  } catch (err: any) {
    console.error("Dashboard data load failed:", err);
    
    if (err.response?.status === 401) {
      error.value = "Please login again to view your dashboard";
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/login");
    } else if (err.response?.status === 422) {
      error.value = "Dashboard data is temporarily unavailable";
    } else {
      error.value = err.response?.data?.message || "Failed to load dashboard data";
    }
  } finally {
    loading.value = false;
  }
};

// View order details function
const viewOrderDetails = (orderId: number) => {
  // Navigate to order details page
  router.push(`/orders/${orderId}`);
};

// View all orders
const viewAllOrders = () => {
  router.push('/orderHistory');
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
          <p>{{ error }}</p>
          <button 
            @click="fetchDashboardData" 
            class="mt-2 bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition"
          >
            Retry
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
              <p class="text-2xl font-bold text-yellow-600">{{ stats.pending_orders }}</p>
              <p class="text-gray-500 font-medium">Pending Orders</p>
            </div>
            <div class="bg-white shadow rounded-xl p-6 text-center hover:shadow-lg transition">
              <p class="text-2xl font-bold text-green-600">{{ stats.completed_orders }}</p>
              <p class="text-gray-500 font-medium">Completed Orders</p>
            </div>
            <div class="bg-white shadow rounded-xl p-6 text-center hover:shadow-lg transition">
              <p class="text-2xl font-bold text-red-600">{{ stats.cancelled_orders }}</p>
              <p class="text-gray-500 font-medium">Cancelled Orders</p>
            </div>
            <div class="bg-white shadow rounded-xl p-6 text-center hover:shadow-lg transition">
              <p class="text-2xl font-bold text-blue-600">{{ stats.total_orders }}</p>
              <p class="text-gray-500 font-medium">Total Orders</p>
            </div>
          </div>

          <!-- Recent Orders Section -->
          <div class="bg-white shadow rounded-xl p-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-bold text-gray-800">Recent Orders</h2>
              <button 
                @click="viewAllOrders"
                class="text-blue-600 hover:text-blue-800 font-medium text-sm"
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
                    <th class="py-3 px-4 font-semibold text-gray-700">Order</th>
                    <th class="py-3 px-4 font-semibold text-gray-700">Total Amount</th>
                    <th class="py-3 px-4 font-semibold text-gray-700">Date</th>
                    <th class="py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th class="py-3 px-4 font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="order in latestOrders" 
                    :key="order.order_id" 
                    class="border-b hover:bg-gray-50 transition"
                  >
                    <td class="py-3 px-4">{{ order.order_id }}</td>
                    <td class="py-3 px-4">
                      {{ formatOrderItems(order) }}
                    </td>
                    <td class="py-3 px-4 font-medium">
                      {{ formatCurrency(order.total_price) }}
                    </td>
                    <td class="py-3 px-4">{{ formatDate(order.created_at) }}</td>
                    <td class="py-3 px-4 font-medium" :class="getStatusColor(order.status)">
                      {{ order.status }}
                    </td>
                    <td class="py-3 px-4">
                      <button 
                        @click="viewOrderDetails(order.order_id)"
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