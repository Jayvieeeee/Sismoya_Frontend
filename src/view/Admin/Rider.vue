<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import AdminLayout from "@/Layout/AdminLayout.vue"
import axiosInstance from "@/utils/axios"
import RiderDetailsModal from "@/components/RiderDetailsModal.vue"
import AddRiderModal from "@components/AddRider.vue"
import Modal from "@/components/Modal.vue"

const search = ref("")
const riders = ref<any[]>([])
const loading = ref(true)

const showRiderModal = ref(false)
const selectedRider = ref<any | null>(null)
const deliveryHistory = ref<any[]>([])

const showAddRiderModal = ref(false)
const showConfirmModal = ref(false)
const riderToToggle = ref<any | null>(null)

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

// View Rider Details
async function viewRiderDetails(rider: any) {
  try {
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

// Confirm Toggle Status
function confirmToggleStatus(rider: any) {
  riderToToggle.value = rider
  showConfirmModal.value = true
}

// Handle Toggle Confirm
async function handleToggleConfirm() {
  if (!riderToToggle.value) return

  const rider = riderToToggle.value
  const newStatus = rider.status === "Active" ? "Inactive" : "Active"

  try {
    const { data } = await axiosInstance.put(
      `/admin/riders/${rider.id}/update-status`,
      { status: newStatus.toLowerCase() }
    )

    if (!data.error) {
      rider.status = newStatus
      if (selectedRider.value && selectedRider.value.id === rider.id) {
        selectedRider.value.status = newStatus
      }

      await loadRiders()

      showConfirmModal.value = false
      showRiderModal.value = false
    }
  } catch (error) {
    console.error("Error updating status:", error)
  } finally {
    riderToToggle.value = null
  }
}

// Filtered Search
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
    <div class="p-4 sm:p-6 max-w-7xl mx-auto w-full font-montserrat">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl sm:text-3xl font-bold text-primary">Delivery Boy</h1>
      </div>

      <!-- Search and Add Rider Row -->
      <div class="mb-4 flex justify-between items-center flex-wrap gap-3">
        <button
          @click="showAddRiderModal = true"
          class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition">
          + Add Rider
        </button>

        <input
          v-model="search"
          type="text"
          placeholder="Search"
          class="w-full sm:w-1/3 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-10 text-gray-500">
        Loading riders...
      </div>

      <!-- Responsive Table -->
      <div
        v-else
        class="bg-white shadow-md rounded-xl overflow-hidden mt-10 border border-gray-100"
      >
        <div class="overflow-x-auto">
          <div class="h-[500px] overflow-y-auto min-w-[900px]">
            <table class="w-full text-sm border-collapse">
              <thead class="sticky top-0 bg-gray-50 z-10">
                <tr class="text-left border-b">
                  <th class="py-3 px-4 font-semibold whitespace-nowrap">
                    Rider ID
                  </th>
                  <th class="py-3 px-4 font-semibold whitespace-nowrap">Name</th>
                  <th class="py-3 px-4 font-semibold whitespace-nowrap">
                    Contact No.
                  </th>
                  <th class="py-3 px-4 font-semibold whitespace-nowrap">
                    Email
                  </th>
                  <th class="py-3 px-4 font-semibold whitespace-nowrap">
                    Status
                  </th>
                  <th class="py-3 px-4 font-semibold whitespace-nowrap">
                    Date Created
                  </th>
                  <th class="py-3 px-4 font-semibold whitespace-nowrap">
                    Action
                  </th>
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
                  class="border-t hover:bg-gray-50 transition"
                >
                  <td class="py-3 px-4 whitespace-nowrap">{{ rider.id }}</td>
                  <td class="py-3 px-4 whitespace-nowrap">{{ rider.name }}</td>
                  <td class="py-3 px-4 whitespace-nowrap">
                    {{ rider.contact_no }}
                  </td>
                  <td class="py-3 px-4 whitespace-nowrap">{{ rider.email }}</td>
                  <td
                    class="py-3 px-4 font-medium whitespace-nowrap"
                    :class="{
                      'text-green-600': rider.status === 'Active',
                      'text-red-600': rider.status === 'Inactive',
                    }"
                  >
                    {{ rider.status }}
                  </td>
                  <td class="py-3 px-4 whitespace-nowrap">
                    {{ rider.date_created }}
                  </td>
                  <td class="py-3 px-4 whitespace-nowrap">
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
      </div>
    </div>
  </AdminLayout>

  <!-- Rider Details Modal -->
  <RiderDetailsModal
    v-model="showRiderModal"
    :rider="selectedRider"
    :delivery-history="deliveryHistory"
    @toggle-status="confirmToggleStatus"
  />

  <!-- Add Rider Modal -->
  <AddRiderModal
    v-if="showAddRiderModal"
    v-model="showAddRiderModal"
    @rider-added="loadRiders"
  />

  <!-- Confirmation Modal -->
  <Modal
    v-if="showConfirmModal"
    :visible="showConfirmModal"
    :title="
      riderToToggle?.status === 'Active'
        ? 'Deactivate Rider?'
        : 'Activate Rider?'
    "
    @close="showConfirmModal = false"
  >
    <div class="text-center text-gray-700">
      <p>
        Are you sure you want to
        <span
          class="font-semibold"
          :class="
            riderToToggle?.status === 'Active'
              ? 'text-red-600'
              : 'text-green-600'
          "
        >
          {{
            riderToToggle?.status === 'Active' ? 'deactivate' : 'activate'
          }}
        </span>
        this rider?
      </p>
    </div>

    <template #actions>
      <button
        @click="showConfirmModal = false"
        class="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition"
      >
        No
      </button>
      <button
        @click="handleToggleConfirm"
        class="px-5 py-2 rounded-lg bg-primary hover:bg-secondary text-white font-medium transition"
      >
        Yes
      </button>
    </template>
  </Modal>
</template>

<style scoped>
/* Optional: cleaner scrollbar */
::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
