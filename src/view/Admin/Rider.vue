<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import AdminLayout from "@/Layout/AdminLayout.vue"
import axiosInstance from "@/utils/axios"
import RiderDetailsModal from "@/components/RiderDetailsModal.vue"
import AddRiderModal from "@components/AddRider.vue"

const search = ref("")
const riders = ref<any[]>([])
const loading = ref(true)

const showRiderModal = ref(false)
const selectedRider = ref<any | null>(null)
const deliveryHistory = ref<any[]>([])

const showAddRiderModal = ref(false)

// Load all riders
async function loadRiders() {
  try {
    loading.value = true
    const { data } = await axiosInstance.get("/admin/riders")
    if (!data.error && data.riders) {
      riders.value = data.riders.map((r: any) => ({
        id: r.user_id,
        name: r.first_name + " " + r.last_name,
        contact_no: r.contact_no,
        email: r.email,
        status: r.status.charAt(0).toUpperCase() + r.status.slice(1),
        date_created: new Date(r.created_at).toLocaleDateString(),
      }))
    }
  } catch (error) {
    console.error("Error fetching riders:", error)
  } finally {
    loading.value = false
  }
}

// View Riders
async function viewRiderDetails(rider: any) {
  try {
    console.log("Rider object:", rider)
    const { data } = await axiosInstance.get(`/admin/riders/${rider.id}`)
    if (!data.error) {
      selectedRider.value = data.rider
      deliveryHistory.value = data.delivery_history
      showRiderModal.value = true
    } else {
      console.error("Backend error:", data.message)
    }
  } catch (error) {
    console.error("Error loading rider details:", error)
  }
}

// Rider Status 
async function toggleRiderStatus(rider: any) {
  try {
    const newStatus = rider.status === "Active" ? "Inactive" : "Active"
    
    console.log("🔄 Toggling status for rider:", rider.id, "from", rider.status, "to", newStatus)
    
    const { data } = await axiosInstance.put(`/admin/riders/${rider.id}/update-status`, {
      status: newStatus.toLowerCase() // Send the new status in the request body
    })
    
    if (!data.error) {
      // Update the local state
      rider.status = newStatus
      
      // Also update the selected rider in the modal if it's the same rider
      if (selectedRider.value && selectedRider.value.id === rider.id) {
        selectedRider.value.status = newStatus
      }
    } else {
      console.error("Backend error:", data.message)
    }
  } catch (error) {
    console.error("Error updating status:", error)
  }
}

// FILTERED SEARCH
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

onMounted(() => {
  loadRiders()
})
</script>

<template>
  <AdminLayout>
    <div class="p-4 sm:p-6 max-w-7xl mx-auto w-full">
      <h1 class="text-2xl sm:text-3xl font-bold mb-6 text-primary">Riders</h1>

      <!-- Search and Add Rider Row -->
      <div class="mb-4 flex justify-between items-center">
        <button
          @click="showAddRiderModal = true"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Add Rider
        </button>

        <input
          v-model="search"
          type="text"
          placeholder="Search"
          class="w-full sm:w-1/3 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-10 text-gray-500">
        Loading riders...
      </div>

      <!-- Table -->
      <div v-else class="hidden sm:block bg-white shadow-md rounded-xl overflow-hidden">
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
              <tr v-if="filteredRiders.length === 0">
                <td colspan="7" class="text-center py-6 text-gray-500">
                  No riders found.
                </td>
              </tr>

              <tr
                v-else
                v-for="rider in filteredRiders"
                :key="rider.id"
                class="border-t hover:bg-gray-50"
              >
                <td class="py-3 px-4">{{ rider.id }}</td>
                <td class="py-3 px-4">{{ rider.name }}</td>
                <td class="py-3 px-4">{{ rider.contact_no }}</td>
                <td class="py-3 px-4">{{ rider.email }}</td>
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

      <!-- Mobile View -->
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

<RiderDetailsModal
  v-model="showRiderModal"
  :rider="selectedRider"
  :delivery-history="deliveryHistory"
  @toggle-status="toggleRiderStatus"
/>
  <!-- ✅ Add Rider Modal -->
  <AddRiderModal
    v-if="showAddRiderModal"
    v-model="showAddRiderModal"
    @rider-added="loadRiders"
  />
  

</template>
