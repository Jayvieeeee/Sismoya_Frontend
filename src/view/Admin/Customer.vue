<script setup lang="ts">
import { ref, computed } from "vue"
import AdminLayout from "@/Layout/AdminLayout.vue"

const search = ref("")

// Static customer data
const customers = ref([
  {
    id: 1,
    name: "Chrisha Dalmacio",
    email: "dalmaciochrisha@gmail.com",
    contact_no: "09123456789",
    address: "145 Banal St. Bagong Barrio",
    total_orders: 10
  },
  {
    id: 2,
    name: "Jayvie Letada",
    email: "jayvleletada@gmail.com",
    contact_no: "09123456780",
    address: "145 Banal St. Bagong Barrio",
    total_orders: 10
  },
  {
    id: 3,
    name: "Chrisha Dalmacio",
    email: "dalmaciocrisha@gmail.com",
    contact_no: "09123456789",
    address: "123 Bancor St. Bagong Barrio",
    total_orders: 10
  }
])

const filteredCustomers = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return customers.value

  return customers.value.filter((c) => {
    const id = c.id?.toString().toLowerCase() || ""
    const name = c.name?.toLowerCase() || ""
    const email = c.email?.toLowerCase() || ""
    const contact = c.contact_no?.toLowerCase() || ""
    const address = c.address?.toLowerCase() || ""

    return (
      id.includes(query) ||
      name.includes(query) ||
      email.includes(query) ||
      contact.includes(query) ||
      address.includes(query)
    )
  })
})

function viewCustomerInfo(customer: any) {
  alert(`Viewing info for: ${customer.name}`)
  // You can implement a modal or navigation here
}
</script>

<template>
  <AdminLayout>
    <div class="p-4 sm:p-6 max-w-7xl mx-auto w-full">
      <h1 class="text-2xl sm:text-3xl font-bold mb-6 text-primary">Customers</h1>

      <!-- Total Customers Card -->
      <div class="bg-white shadow-md rounded-xl p-6 mb-6 inline-block">
        <div class="text-5xl text-center font-bold text-blue-600 mb-2">
          {{ customers.length }}
        </div>
        <div class="text-gray-600 text-sm">Total Customers</div>
      </div>

      <!-- Search Bar -->
      <div class="mb-4 flex justify-end">
        <input
          v-model="search"
          type="text"
          placeholder="Search"
          class="w-full sm:w-1/3 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Desktop Table with Scrollable Body Inside -->
      <div class="hidden sm:block bg-white shadow-md rounded-xl overflow-hidden">
        <div class="max-h-[calc(100vh-280px)] overflow-y-auto">
          <table class="w-full text-sm text-center">
            <thead class="sticky top-0 bg-gray-50 z-10">
              <tr class="text-left border-b">
                <th class="py-3 px-4 font-semibold">Customer ID</th>
                <th class="py-3 px-4 font-semibold">Name</th>
                <th class="py-3 px-4 font-semibold">Email</th>
                <th class="py-3 px-4 font-semibold">Contact No.</th>
                <th class="py-3 px-4 font-semibold">Addresses</th>
                <th class="py-3 px-4 font-semibold">Total Orders</th>
                <th class="py-3 px-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              <!-- Empty -->
              <tr v-if="filteredCustomers.length === 0">
                <td colspan="7" class="text-center py-6 text-gray-500">
                  No customers found.
                </td>
              </tr>

              <!-- Data Rows -->
              <tr
                v-else
                v-for="customer in filteredCustomers"
                :key="customer.id"
                class="border-t hover:bg-gray-50"
              >
                <td class="py-3 px-4">{{ customer.id }}</td>
                <td class="py-3 px-4">{{ customer.name }}</td>
                <td class="py-3 px-4 text-gray-600">{{ customer.email }}</td>
                <td class="py-3 px-4">{{ customer.contact_no }}</td>
                <td class="py-3 px-4">{{ customer.address }}</td>
                <td class="py-3 px-4">{{ customer.total_orders }}</td>
                <td class="py-3 px-4">
                  <button
                    @click="viewCustomerInfo(customer)"
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

      <!-- Mobile View (Cards) -->
      <div class="sm:hidden space-y-4">
        <div v-if="filteredCustomers.length === 0" class="text-center py-6 text-gray-500">
          No customers found.
        </div>

        <div
          v-else
          v-for="customer in filteredCustomers"
          :key="customer.id"
          class="bg-white shadow rounded-lg p-4 border border-gray-100"
        >
          <div class="flex justify-between items-center mb-2">
            <h2 class="font-semibold text-blue-800">Customer #{{ customer.id }}</h2>
          </div>

          <p class="text-gray-700"><strong>Name:</strong> {{ customer.name }}</p>
          <p class="text-gray-700"><strong>Email:</strong> {{ customer.email }}</p>
          <p class="text-gray-700"><strong>Contact:</strong> {{ customer.contact_no }}</p>
          <p class="text-gray-700"><strong>Address:</strong> {{ customer.address }}</p>
          <p class="text-gray-700"><strong>Total Orders:</strong> {{ customer.total_orders }}</p>

          <div class="mt-3 text-right">
            <button
              @click="viewCustomerInfo(customer)"
              class="text-blue-600 underline hover:text-blue-800 text-sm"
            >
              View Info
            </button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>