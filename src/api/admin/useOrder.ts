// composables/useOrders.ts
import { ref, onMounted, computed } from 'vue'
import axiosInstance from "@/utils/axios"
import { useRouter } from "vue-router"
import { getProfile, logout } from "@/utils/auth"

export interface Order {
  id: number
  order_id: number
  customer_name: string
  customerName?: string
  products: string
  product?: string
  total_price: number
  totalAmount?: number
  date_time: string
  created_at: string
  status:
    | 'pending'
    | 'to_pickup'
    | 'to_pick_up'
    | 'picked_up'
    | 'picked up'
    | 'preparing'
    | 'to_deliver'
    | 'completed'
    | 'cancelled'
  payment_method?: string
  payment_status?: string
  items?: any[]
  customer_phone?: string
  customer_email?: string
  delivery_address?: string
  special_instructions?: string
}

export function useOrders() {
  const router = useRouter()

  const searchQuery = ref('')
  const orders = ref<Order[]>([])
  const isLoading = ref(false)
  const backendError = ref('')
  const selectedOrder = ref<Order | null>(null)
  const isModalOpen = ref(false)

  // ==============================
  // 🧮 STATUS STATS
  // ==============================
  const stats = computed(() => {
    const statusCounts = {
      'Pending': 0,
      'To Pick-Up': 0,
      'To Deliver': 0,
      'Completed': 0
    }

    orders.value.forEach(order => {
      const status = getDisplayStatus(order.status)
      if (status in statusCounts) {
        statusCounts[status as keyof typeof statusCounts]++
      }
    })

    return [
      { label: 'Pending', count: statusCounts.Pending, color: 'bg-orange-100 text-orange-800' },
      { label: 'To Pick-Up', count: statusCounts['To Pick-Up'], color: 'bg-blue-100 text-blue-800' },
      { label: 'To Deliver', count: statusCounts['To Deliver'], color: 'bg-purple-100 text-purple-800' },
      { label: 'Completed', count: statusCounts.Completed, color: 'bg-green-100 text-green-800' }
    ]
  })

  // ==============================
  // 🧩 HELPERS
  // ==============================
  const getDisplayStatus = (status: string): string => {
    const statusMap: { [key: string]: string } = {
      'pending': 'Pending',
      'to_pickup': 'To Pick-Up',
      'to_pick_up': 'To Pick-Up',
      'picked_up': 'Picked Up',
      'picked up': 'Picked Up',
      'preparing': 'Preparing',
      'to_deliver': 'To Deliver',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    }
    return statusMap[status] || status
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    try {
      const d = new Date(dateString)
      if (isNaN(d.getTime())) return 'Invalid Date'
      return d.toLocaleString("en-PH", {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    } catch {
      return dateString || 'N/A'
    }
  }

  const getProductName = (order: Order) => order.products || order.product || "Water Gallon"
  const getCustomerName = (order: Order) => order.customer_name || order.customerName || "Customer"

  const formatPrice = (price: any): string => {
    const numPrice = Number(price) || 0
    return `₱${numPrice.toFixed(2)}`
  }

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'pending': 'bg-orange-100 text-orange-800',
      'to_pickup': 'bg-blue-100 text-blue-800',
      'to_pick_up': 'bg-blue-100 text-blue-800',
      'picked_up': 'bg-gray-100 text-gray-800',
      'picked up': 'bg-gray-100 text-gray-800',
      'preparing': 'bg-purple-100 text-purple-800',
      'to_deliver': 'bg-indigo-100 text-indigo-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  // ==============================
  // 📦 MODAL HANDLERS
  // ==============================
  const openOrderDetails = (order: Order) => {
    selectedOrder.value = order
    isModalOpen.value = true
  }

  const closeModal = () => {
    isModalOpen.value = false
    selectedOrder.value = null
  }

  // ==============================
  // 🔗 API HANDLERS
  // ==============================
  const fetchOrders = async () => {
    isLoading.value = true
    backendError.value = ''

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        console.warn('No token found, redirecting to login')
        router.push("/login")
        return
      }

      // Validate token first
      try {
        await getProfile()
      } catch (profileError) {
        console.warn('Token invalid, logging out:', profileError)
        await logout()
        router.push("/login")
        return
      }

      console.log('🔄 Fetching orders from:', '/admin/orders')
      
      const response = await axiosInstance.get('/admin/orders', {
        timeout: 10000, // 10 second timeout
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('📦 Orders API Response:', response)

      if (response.data && (response.data.data || response.data.orders)) {
        orders.value = response.data.data || response.data.orders || []
        console.log('✅ Orders fetched successfully:', orders.value.length)
      } else {
        console.warn('⚠️ Unexpected response structure:', response.data)
        throw new Error(response.data?.message || 'Invalid response format from server')
      }
    } catch (err: any) {
      console.error('❌ Error fetching orders:', err)
      
      if (err.code === 'ECONNABORTED') {
        backendError.value = "Request timeout. Please check your connection."
      } else if (err.response) {
        // Server responded with error status
        const status = err.response.status
        const message = err.response.data?.message || err.response.statusText
        
        switch (status) {
          case 401:
            backendError.value = "Session expired. Please login again."
            await logout()
            router.push("/login")
            break
          case 403:
            backendError.value = "You don't have permission to view orders."
            break
          case 404:
            backendError.value = "Orders endpoint not found."
            break
          case 500:
            backendError.value = "Server error. Please try again later."
            break
          default:
            backendError.value = `Error ${status}: ${message}`
        }
      } else if (err.request) {
        // Request was made but no response received
        backendError.value = "Cannot connect to server. Please check your internet connection."
      } else {
        // Something else happened
        backendError.value = err.message || "Failed to load orders. Please try again."
      }
    } finally {
      isLoading.value = false
    }
  }

  const filterByStatus = async (status: string) => {
    isLoading.value = true
    backendError.value = ''
    try {
      // Client-side filtering
      if (!status) {
        await fetchOrders()
        return
      }

      // First, make sure we have all orders
      if (orders.value.length === 0) {
        await fetchOrders()
      }

      // Map display status to backend status
      const statusMap: { [key: string]: string } = {
        'Pending': 'pending',
        'To Pick-Up': 'to_pickup',
        'To Deliver': 'to_deliver',
        'Completed': 'completed',
        'Cancelled': 'cancelled'
      }
      
      const backendStatus = statusMap[status] || status.toLowerCase()
      
      // Filter orders client-side
      const filtered = orders.value.filter(order => order.status === backendStatus)
      orders.value = filtered
      
    } catch (err: any) {
      console.error('Error filtering orders:', err)
      backendError.value = "Failed to filter orders."
    } finally {
      isLoading.value = false
    }
  }

  // ✅ FIXED: Correct endpoint to match PHP controller
async function updateOrderStatus(orderId: number, action: string) {
  try {
    const response = await axiosInstance.put(
      `/admin/orders/${orderId}/update-stats`,
      { id: orderId, action } // ✅ backend expects "action"
    );
    console.log("✅ Update success:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Backend error:", error.response?.data || error.message);
    throw new Error("Failed to update order status");
  }
}



  // ==============================
  // ⚙️ ACTION FLOW WITH CONFIRMATION - MATCHING BACKEND LOGIC
  // ==============================
  const getActionButtons = (status: string) => {
    const normalizedStatus = status.toLowerCase().replace(' ', '_')
    
    switch (normalizedStatus) {
      case 'pending':
        return ['approve', 'cancel'] // Approve → to_pickup, Cancel → cancelled
      case 'picked_up':
      case 'picked up':
        return ['mark_preparing'] // Mark as Preparing → preparing
      case 'preparing':
        return ['mark_to_deliver'] // Mark as To Deliver → to_deliver
      case 'to_deliver':
      case 'completed':
      case 'cancelled':
        return [] // No actions for these statuses
      default:
        return []
    }
  }

  // Confirmation messages for each action
  const getConfirmationMessage = (action: string, orderId: number, currentStatus: string): string => {
    const messages: { [key: string]: string } = {
      'approve': `Are you sure you want to APPROVE Order #${orderId}? This will change status from "${getDisplayStatus(currentStatus)}" to "To Pick-Up".`,
      'cancel': `Are you sure you want to CANCEL Order #${orderId}? This will change status from "${getDisplayStatus(currentStatus)}" to "Cancelled". This action cannot be undone.`,
      'mark_preparing': `Are you sure you want to mark Order #${orderId} as PREPARING? This will change status from "${getDisplayStatus(currentStatus)}" to "Preparing".`,
      'mark_to_deliver': `Are you sure you want to mark Order #${orderId} as READY FOR DELIVERY? This will change status from "${getDisplayStatus(currentStatus)}" to "To Deliver".`
    }
    return messages[action] || `Are you sure you want to perform this action on Order #${orderId}?`
  }

  // Action display names for confirmation
  const getActionDisplayName = (action: string): string => {
    const names: { [key: string]: string } = {
      'approve': 'Approve',
      'cancel': 'Cancel',
      'mark_preparing': 'Mark as Preparing',
      'mark_to_deliver': 'Mark for Delivery'
    }
    return names[action] || action
  }

  const handleAction = async (orderId: number, action: string, currentStatus: string) => {
    try {
      console.log('Handling action:', { orderId, action, currentStatus })
      
      // Show confirmation dialog
      const confirmationMessage = getConfirmationMessage(action, orderId, currentStatus)
      const actionName = getActionDisplayName(action)
      
      if (!confirm(`${confirmationMessage}\n\nClick OK to ${actionName.toLowerCase()} this order.`)) {
        console.log('Action cancelled by user')
        return
      }

      console.log('User confirmed action, proceeding...')
      
      // Send the exact action name that backend expects with order ID in body
      const result = await updateOrderStatus(orderId, action)
      
      // Refresh the orders list to get updated data
      await fetchOrders()
      
      // Use the success message from backend
      backendError.value = `✅ ${result.message || `Order #${orderId} successfully ${getActionDisplayName(action).toLowerCase()}ed`}`
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        if (backendError.value.includes('✅')) {
          backendError.value = ''
        }
      }, 3000)
      
    } catch (error: any) {
      console.error('Error handling action:', error)
      // Show the specific backend error message
      backendError.value = error.message || 'Failed to update order status. Please try again.'
    }
  }

  // ==============================
  // 🔍 FILTERING & INITIAL LOAD
  // ==============================
  const filteredOrders = computed(() => {
    if (!searchQuery.value) return orders.value
    const query = searchQuery.value.toLowerCase()
    return orders.value.filter(order =>
      getCustomerName(order).toLowerCase().includes(query) ||
      getProductName(order).toLowerCase().includes(query) ||
      (order.order_id?.toString() || '').includes(query) ||
      (order.id?.toString() || '').includes(query)
    )
  })

  // Add retry logic for better reliability
  const fetchWithRetry = async (retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        await fetchOrders()
        if (orders.value.length > 0 || !backendError.value) {
          break // Success
        }
      } catch (error) {
        if (i === retries - 1) throw error
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
      }
    }
  }

  const checkNetworkStatus = () => {
    if (!navigator.onLine) {
      backendError.value = "You are offline. Please check your internet connection."
      return false
    }
    return true
  }

  // Enhanced fetch with network check
  const fetchOrdersWithCheck = async () => {
    if (!checkNetworkStatus()) return
    await fetchWithRetry().catch(error => {
      console.error('All retry attempts failed:', error)
    })
  }

  onMounted(fetchOrdersWithCheck)

  return {
    searchQuery,
    orders: filteredOrders,
    isLoading,
    backendError,
    selectedOrder,
    isModalOpen,
    stats,
    openOrderDetails,
    closeModal,
    fetchOrders: fetchOrdersWithCheck,
    filterByStatus,
    handleAction,
    getActionButtons,
    getDisplayStatus,
    formatDate,
    getProductName,
    getCustomerName,
    formatPrice,
    getStatusColor
  }
}