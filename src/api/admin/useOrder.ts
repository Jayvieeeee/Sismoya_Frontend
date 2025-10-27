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

  const openOrderDetails = (order: Order) => {
    selectedOrder.value = order
    isModalOpen.value = true
  }

  const closeModal = () => {
    isModalOpen.value = false
    selectedOrder.value = null
  }

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
      } else {
        throw new Error(response.data?.message || 'Invalid response format from server')
      }
    } catch (err: any) {
      
      if (err.code === 'ECONNABORTED') {
        backendError.value = "Request timeout. Please check your connection."
      } else if (err.response) {
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
        backendError.value = "Cannot connect to server. Please check your internet connection."
      } else {
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
      if (!status) {
        await fetchOrders()
        return
      }

      if (orders.value.length === 0) {
        await fetchOrders()
      }

      const statusMap: { [key: string]: string } = {
        'Pending': 'pending',
        'To Pick-Up': 'to_pickup',
        'To Deliver': 'to_deliver',
        'Completed': 'completed',
        'Cancelled': 'cancelled'
      }
      
      const backendStatus = statusMap[status] || status.toLowerCase()
      
      const filtered = orders.value.filter(order => order.status === backendStatus)
      orders.value = filtered
      
    } catch (err: any) {
      console.error('Error filtering orders:', err)
      backendError.value = "Failed to filter orders."
    } finally {
      isLoading.value = false
    }
  }

  async function updateOrderStatus(orderId: number, action: string) {
    try {
      const response = await axiosInstance.put(
        `/admin/orders/${orderId}/update-stats`,
        { id: orderId, action } 
      );
      return response.data;
    } catch (error: any) {
      throw new Error("Failed to update order status");
    }
  }

  const getActionButtons = (status: string) => {
    const normalizedStatus = status.toLowerCase().replace(' ', '_')
    
    switch (normalizedStatus) {
      case 'pending':
        return ['approve', 'cancel'] 
      case 'picked_up':
      case 'picked up':
        return ['mark_preparing'] 
      case 'preparing':
        return ['mark_to_deliver'] 
      case 'to_deliver':
      case 'completed':
      case 'cancelled':
        return []
      default:
        return []
    }
  }

  // Get confirmation message for SweetAlert
  const getConfirmationMessage = (action: string, orderId: number, currentStatus: string): string => {
    const messages: { [key: string]: string } = {
      'approve': `Are you sure you want to APPROVE Order #${orderId}?`,
      'cancel': `Are you sure you want to CANCEL Order #${orderId}? This action cannot be undone.`,
      'mark_preparing': `Are you sure you want to mark Order #${orderId} as PREPARING?`,
      'mark_to_deliver': `Are you sure you want to mark Order #${orderId} as TO DELIVER?`
    }
    return messages[action] || `Are you sure you want to perform this action on Order #${orderId}?`
  }

  // Get SweetAlert configuration based on action
  const getSwalConfig = (action: string, orderId: number) => {
    const configs: { [key: string]: any } = {
      'approve': {
        title: 'Approve Order?',
        text: getConfirmationMessage(action, orderId, ''),
        icon: 'question',
        confirmButtonText: 'Yes, Approve!',
        confirmButtonColor: '#10B981',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        iconColor: '#10B981'
      },
      'cancel': {
        title: 'Cancel Order?',
        text: getConfirmationMessage(action, orderId, ''),
        icon: 'warning',
        confirmButtonText: 'Yes, Cancel!',
        confirmButtonColor: '#EF4444',
        showCancelButton: true,
        cancelButtonText: 'Keep Order',
        iconColor: '#EF4444'
      },
      'mark_preparing': {
        title: 'Mark as Preparing?',
        text: getConfirmationMessage(action, orderId, ''),
        icon: 'info',
        confirmButtonText: 'Yes, Mark Preparing!',
        confirmButtonColor: '#3B82F6',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        iconColor: '#3B82F6'
      },
      'mark_to_deliver': {
        title: 'Mark for Delivery?',
        text: getConfirmationMessage(action, orderId, ''),
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
      text: getConfirmationMessage(action, orderId, ''),
      icon: 'question',
      confirmButtonText: 'Confirm',
      confirmButtonColor: '#6B7280',
      showCancelButton: true,
      cancelButtonText: 'Cancel'
    }
  }

  // Modified handleAction to work with SweetAlert (returns a promise)
  const handleAction = async (orderId: number, action: string, currentStatus: string): Promise<boolean> => {
    try {
      console.log('Handling action:', { orderId, action, currentStatus })
      
      const result = await updateOrderStatus(orderId, action)
      
      await fetchOrders()
      
      backendError.value = `${result.message || `Order #${orderId} successfully processed`}`
      
      setTimeout(() => {
        if (backendError.value.includes('successfully')) {
          backendError.value = ''
        }
      }, 3000)
      
      return true
      
    } catch (error: any) {
      console.error('Error handling action:', error)
      backendError.value = error.message || 'Failed to update order status. Please try again.'
      return false
    }
  }

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
    handleAction, // Now returns a promise for SweetAlert integration
    getActionButtons,
    getDisplayStatus,
    formatDate,
    getProductName,
    getCustomerName,
    formatPrice,
    getStatusColor,
    getSwalConfig // Export this for use in the component
  }
}