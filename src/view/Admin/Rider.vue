<script setup lang="ts">
import { ref, computed } from "vue"
import AdminLayout from "@/Layout/AdminLayout.vue"

const search = ref("")

// Static rider data
const riders = ref([
  {
    id: 1,
    name: "Chrisha Dalmacio",
    contact_no: "09123456789",
    email: "dalmacioehrisha@gmail.com",
    status: "Inactive",
    date_created: "01-10-2025"
  },
  {
    id: 2,
    name: "Jayvie Letada",
    contact_no: "09123456789",
    email: "jayvleletada@gmail.com",
    status: "Active",
    date_created: "01-10-2025"
  },
  {
    id: 3,
    name: "Eragp Campo",
    contact_no: "09123456789",
    email: "sampeweap@gmail.com",
    status: "Inactive",
    date_created: "03-25-2025"
  }
])

const filteredRiders = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return riders.value

  return riders.value.filter((r) => {
    const id = r.id?.toString().toLowerCase() || ""
    const name = r.name?.toLowerCase() || ""
    const contact = r.contact_no?.toLowerCase() || ""
    const email = r.email?.toLowerCase() || ""
    const status = r.status?.toLowerCase() || ""
    const date = r.date_created?.toLowerCase() || ""

    return (
      id.includes(query) ||
      name.includes(query) ||
      contact.includes(query) ||
      email.includes(query) ||
      status.includes(query) ||
      date.includes(query)
    )
  })
})

function viewRiderDetails(rider: any) {
  alert(`Viewing details for: ${rider.name}`)
  // You can implement a modal or navigation here
}
</script>

<template>
  <AdminLayout>
    <div class="p-4 sm:p-6 max-w-7xl mx-auto w-full">
      <h1 class="text-2xl sm:text-3xl font-bold mb-6 text-primary">Riders</h1>

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
        <div class="max-h-[calc(100vh-220px)] overflow-y-auto">
          <table class="w-full text-sm">
            <thead class="sticky top-0 bg-gray-50 z-10">
              <tr class="text-left border-b">
                <th class="py-3 px-4 font-semibold">Rider ID</th>
                <th class="py-3 px-4 font-semibold">Name</th>
                <th class="py-3 px-4 font-semibold">Contact No.</th>
                <th class="py-3 px-4 font-semibold">Email</th>
                <th class="py-3 px-4 font-semibold">Status</th>
                <th class="py-3 px-4 font-semibold">Date Created</th>
                <th class="py-3 px-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              <!-- Empty -->
              <tr v-if="filteredRiders.length === 0">
                <td colspan="7" class="text-center py-6 text-gray-500">
                  No riders found.
                </td>
              </tr>

              <!-- Data Rows -->
              <tr
                v-else
                v-for="rider in filteredRiders"
                :key="rider.id"
                class="border-t hover:bg-gray-50"
              >
                <td class="py-3 px-4">{{ rider.id }}</td>
                <td class="py-3 px-4">{{ rider.name }}</td>
                <td class="py-3 px-4">{{ rider.contact_no }}</td>
                <td class="py-3 px-4 text-gray-600">{{ rider.email }}</td>
                <td
                  class="py-3 px-4 font-medium"
                  :class="{
                    'text-green-600': rider.status === 'Active',
                    'text-red-600': rider.status === 'Inactive'
                  }"
                >
                  {{ rider.status }}
                </td>
                <td class="py-3 px-4">{{ rider.date_created }}</td>
                <td class="py-3 px-4">
                  <button
                    @click="viewRiderDetails(rider)"
                    class="text-blue-600 underline hover:text-blue-800 font-medium"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Mobile View (Cards) -->
      <div class="sm:hidden space-y-4">
        <div v-if="filteredRiders.length === 0" class="text-center py-6 text-gray-500">
          No riders found.
        </div>

        <div
          v-else
          v-for="rider in filteredRiders"
          :key="rider.id"
          class="bg-white shadow rounded-lg p-4 border border-gray-100"
        >
          <div class="flex justify-between items-center mb-2">
            <h2 class="font-semibold text-blue-800">Rider #{{ rider.id }}</h2>
            <span
              class="text-sm font-medium"
              :class="{
                'text-green-600': rider.status === 'Active',
                'text-red-600': rider.status === 'Inactive'
              }"
            >
              {{ rider.status }}
            </span>
          </div>

          <p class="text-gray-700"><strong>Name:</strong> {{ rider.name }}</p>
          <p class="text-gray-700"><strong>Contact:</strong> {{ rider.contact_no }}</p>
          <p class="text-gray-700"><strong>Email:</strong> {{ rider.email }}</p>
          <p class="text-gray-700"><strong>Date Created:</strong> {{ rider.date_created }}</p>

          <div class="mt-3 text-right">
            <button
              @click="viewRiderDetails(rider)"
              class="text-blue-600 underline hover:text-blue-800 text-sm"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>