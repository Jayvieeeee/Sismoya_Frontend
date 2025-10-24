<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import AdminLayout from "@/Layout/AdminLayout.vue"
import axiosInstance from "@/utils/axios"
import CustomerInfoModal from "@/components/customerInfoModal.vue"


const search = ref("")
const customers = ref<any[]>([])
const loading = ref(false)
const error = ref("")
const totalCustomers = ref(0)

const showModal = ref(false)
const selectedCustomerId = ref<number | undefined>(undefined)

const fetchCustomers = async () => {
  loading.value = true
  error.value = ""

  try {
    const response = await axiosInstance.get("/admin/customers")

    if (response.data.error) {
      throw new Error(response.data.message || "API returned an error")
    }

    customers.value = response.data.data || []
    totalCustomers.value =
      response.data.total_customers || customers.value.length
  } catch (err: any) {
    console.error("Error fetching customers:", err)
    if (err.response?.data?.message) {
      error.value = err.response.data.message
    } else if (err.response?.status === 403) {
      error.value = "You don't have permission to view customers."
    } else if (err.response?.status === 404) {
      error.value = "Customers endpoint not found."
    } else if (err.message?.includes("Network Error")) {
      error.value = "Network error. Please check your connection."
    } else {
      error.value = err.message || "Failed to load customers"
    }
  } finally {
    loading.value = false
  }
}

const openCustomerInfo = (customer: any) => {
 selectedCustomerId.value = Number(customer.customer_id)
  showModal.value = true
}

const filteredCustomers = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return customers.value

  return customers.value.filter((c) => {
    const id = c.customer_id?.toString().toLowerCase() || ""
    const name = c.name?.toLowerCase() || ""
    const email = c.email?.toLowerCase() || ""
    const contact = c.contact_no?.toLowerCase() || ""
    const address = c.address?.toLowerCase() || ""
    return (
      id.includes(q) ||
      name.includes(q) ||
      email.includes(q) ||
      contact.includes(q) ||
      address.includes(q)
    )
  })
})

onMounted(fetchCustomers)
</script>

<template>
  <AdminLayout>
    <div class="p-4 sm:p-6 max-w-full mx-auto w-full">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl sm:text-3xl font-bold text-primary">Customers</h1>
        <button
          @click="fetchCustomers"
          :disabled="loading"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
        >
          <svg
            v-if="loading"
            class="animate-spin h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 
                 5.291A7.962 7.962 0 014 12H0
                 c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {{ loading ? "Refreshing..." : "Refresh" }}
        </button>
      </div>

      <div
        v-if="error"
        class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
      >
        <div class="flex items-start">
          <div class="flex-1">
            <div class="text-red-800 font-semibold mb-2">
              Error Loading Customers
            </div>
            <div class="text-red-600 text-sm">{{ error }}</div>
          </div>
        </div>
      </div>

      <div v-else-if="loading" class="text-center py-8">
        <div
          class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
        ></div>
        <p class="mt-2 text-gray-600">Loading customers...</p>
      </div>

      <div v-else>
        <div class="bg-white shadow-md rounded-xl p-6 mb-6 inline-block">
          <div class="text-5xl text-center font-bold text-blue-600 mb-2">
            {{ totalCustomers }}
          </div>
          <div class="text-gray-600 text-sm">Total Customers</div>
        </div>

        <div class="mb-4 flex justify-end">
          <input
            v-model="search"
            type="text"
            placeholder="Search by Customer"
            class="w-1/2 sm:w-1/4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div
          class="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100"
        >
          <div
            class="max-h-[500px] overflow-x-auto overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-100"
          >
            <table
              class="min-w-[900px] w-full text-sm text-center border-collapse"
            >
              <thead class="bg-gray-50">
                <tr class="border-b">
                  <th class="py-3 px-4 text-left font-semibold whitespace-nowrap">
                    Customer ID
                  </th>
                  <th class="py-3 px-4 text-left font-semibold whitespace-nowrap">
                    Name
                  </th>
                  <th class="py-3 px-4 text-left font-semibold whitespace-nowrap">
                    Email
                  </th>
                  <th class="py-3 px-4 text-left font-semibold whitespace-nowrap">
                    Contact No.
                  </th>
                  <th class="py-3 px-4 text-left font-semibold whitespace-nowrap">
                    Address
                  </th>
                  <th class="py-3 px-4 text-left font-semibold whitespace-nowrap">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="filteredCustomers.length === 0 && !loading">
                  <td colspan="6" class="text-center py-6 text-gray-500">
                    {{
                      customers.length === 0
                        ? "No customers available"
                        : "No customers match your search"
                    }}
                  </td>
                </tr>

                <tr
                  v-for="customer in filteredCustomers"
                  :key="customer.customer_id"
                  class="border-t hover:bg-gray-50"
                >
                  <td class="py-3 px-4 text-left">{{ customer.customer_id }}</td>
                  <td class="py-3 px-4 text-left">{{ customer.name }}</td>
                  <td class="py-3 px-4 text-left">{{ customer.email }}</td>
                  <td class="py-3 px-4 text-left">
                    {{ customer.contact_no || "N/A" }}
                  </td>
                  <td class="py-3 px-4 text-left truncate max-w-[200px]">
                    {{ customer.address || "N/A" }}
                  </td>
                  <td class="py-3 px-4 text-left">
                    <button
                      @click="openCustomerInfo(customer)"
                      class="text-blue-600 underline hover:text-blue-800 font-medium"
                    >
                      View Info
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <CustomerInfoModal
        :show="showModal"
        :customerId="selectedCustomerId"
        @close="showModal = false"
      />
    </div>
  </AdminLayout>
</template>
