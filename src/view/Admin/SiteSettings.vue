<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { PencilSquareIcon, PlusIcon, TrashIcon } from '@heroicons/vue/24/outline'
import AdminLayout from '@/Layout/AdminLayout.vue'
import Modal from '@/components/Modal.vue'
import axiosInstance from '@/utils/axios'
import { handleLogout } from '@/utils/auth'

const activeMenu = ref('gallons-details')
const gallons = ref<any[]>([])
const loading = ref(true)
const error = ref<string | null>(null) 

const modalVisible = ref(false)
const isUpdate = ref(false)
const uploading = ref(false)
const selectedGallon = reactive({
  gallon_id: null,
  name: '',
  image_url: '',
  size: '',
  price: ''
})

const IMAGE_BASE_URL = 'https://sismoya.bsit3b.site/api'
const previewImage = ref<string | null>(null)

// Fetch Gallons
const fetchGallons = async () => {
  try {
    const res = await axiosInstance.get('/gallons')
    gallons.value = res.data
  } catch (err: any) {
    console.error('Error fetching gallons:', err)
    if (err.response?.status === 401) {
      await handleLogout('Your session expired. Please log in again.')
    } else {
      error.value = err.response?.data?.message || 'Failed to load gallons.'
    }
  } finally {
    loading.value = false
  }
}

onMounted(fetchGallons)

//  Open Add Modal
const openAddModal = () => {
  isUpdate.value = false
  Object.assign(selectedGallon, {
    gallon_id: null,
    name: '',
    image_url: '',
    size: '',
    price: ''
  })
  previewImage.value = null
  modalVisible.value = true
}

// Open Update Modal
const openUpdateModal = (gallon: any) => {
  isUpdate.value = true
  Object.assign(selectedGallon, { ...gallon })
  previewImage.value = getImageUrl(gallon.image_url)
  modalVisible.value = true
}

// Get Image URL
const getImageUrl = (url: string) => {
  if (!url) return ''
  return url.startsWith('http') ? url : `${IMAGE_BASE_URL}/${url}`
}

// Upload Image
const handleImageUpload = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  previewImage.value = URL.createObjectURL(file)
  uploading.value = true

  try {
    const formData = new FormData()
    formData.append('image', file)

    // Make sure this matches your backend route for image upload
    const res = await axiosInstance.post('/gallons', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    // Automatically set image_url from backend response
    if (res.data.url) {
      selectedGallon.image_url = res.data.url
      console.log('Image uploaded:', selectedGallon.image_url)
    } else if (res.data.path) {
      // fallback if backend uses "path" instead of "url"
      selectedGallon.image_url = res.data.path
      console.log(' Image uploaded (path):', selectedGallon.image_url)
    } else {
      alert('Upload failed: No image URL returned from server.')
    }
  } catch (err) {
    console.error(' Image upload failed:', err)
    alert('Image upload failed. Please check your server.')
  } finally {
    uploading.value = false
  }
}


// 💾 Save Gallon
const handleSave = async () => {
  try {
    if (isUpdate.value) {
      await axiosInstance.put(`/gallons/${selectedGallon.gallon_id}`, selectedGallon)
    } else {
      await axiosInstance.post('/gallons', selectedGallon)
    }
    modalVisible.value = false
    await fetchGallons()
  } catch (err: any) {
    console.error('Error saving gallon:', err)
    alert('Failed to save gallon.')
  }
}

//Delete 
const handleDelete = async (gallon_id: number) => {
  if (!confirm('Are you sure you want to delete this gallon?')) return

  try {
    const res = await axiosInstance.delete(`/gallons/${gallon_id}`)

    if (res.data.success) {
      await fetchGallons() // <-- Force re-fetch list
    } else {
      alert(res.data.message || 'Delete failed.')
    }
  } catch (err: any) {
    console.error('Error deleting gallon:', err)
    alert('Failed to delete gallon.')
  }
}


</script>

<template>
  <AdminLayout>
    <div class="min-h-screen p-8">
      <h1 class="text-3xl font-bold text-cyan-600 mb-20">Site Settings</h1>

      <div class="bg-white rounded-2xl shadow-lg overflow-hidden flex">
        <div class="flex-1 p-8">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-gray-800">Gallon Details</h2>
            <button
              @click="openAddModal"
              class="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition text-sm"
            >
              <PlusIcon class="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>

          <!-- Loading and Error States -->
          <div v-if="loading" class="text-gray-500">Loading gallons...</div>
          <div v-else-if="error" class="text-red-500">Error: {{ error }}</div>

          <!-- Scrollable Table Container -->
          <div v-else class="rounded-lg overflow-hidden">
            <div class="overflow-auto max-h-[400px]"> <!-- Vertical scrolling -->
              <table class="min-w-full text-sm">
                <thead class="sticky top-0 bg-white z-10">
                  <tr class="border-b border-gray-200">
                    <th class="px-4 py-3 text-left text-gray-600 font-medium min-w-[80px]">ID</th>
                    <th class="px-4 py-3 text-left text-gray-600 font-medium min-w-[100px]">Image</th>
                    <th class="px-4 py-3 text-left text-gray-600 font-medium min-w-[150px]">Name</th>
                    <th class="px-4 py-3 text-left text-gray-600 font-medium min-w-[100px]">Size</th>
                    <th class="px-4 py-3 text-left text-gray-600 font-medium min-w-[100px]">Price</th>
                    <th class="px-4 py-3 text-center text-gray-600 font-medium min-w-[120px]">Action</th>
                  </tr>
                </thead>

                <tbody>
                  <tr
                    v-for="gallon in gallons"
                    :key="gallon.gallon_id"
                    class="border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <td class="px-4 py-4 text-gray-700 whitespace-nowrap">{{ gallon.gallon_id }}</td>

                    <!-- Image -->
                    <td class="px-4 py-4 whitespace-nowrap">
                      <img
                        v-if="gallon.image_url"
                        :src="getImageUrl(gallon.image_url)"
                        alt="Gallon"
                        class="w-14 h-14 object-cover"
                      />
                      <span v-else class="text-gray-400 text-xs italic">No image</span>
                    </td>

                    <td class="px-4 py-4 text-gray-700 whitespace-nowrap">{{ gallon.name }}</td>
                    <td class="px-4 py-4 text-gray-700 whitespace-nowrap">{{ gallon.size }}</td>
                    <td class="px-4 py-4 text-gray-700 whitespace-nowrap">₱{{ gallon.price }}</td>
                    <td class="px-4 py-4 whitespace-nowrap">
                      <div class="flex justify-center gap-2">
                        <!-- Edit Button -->
                        <button
                          @click="openUpdateModal(gallon)"
                          class="inline-flex items-center justify-center p-2 rounded-lg hover:bg-blue-50 transition"
                        >
                          <PencilSquareIcon class="w-5 h-5 text-blue-600" />
                        </button>

                        <!-- 🗑️ Delete Button -->
                        <button
                          @click="handleDelete(gallon.gallon_id)"
                          class="inline-flex items-center justify-center p-2 rounded-lg hover:bg-red-50 transition"
                        >
                          <TrashIcon class="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <Modal
      :visible="modalVisible"
      :title="isUpdate ? 'Update Gallon' : 'Add Gallon'"
      @close="modalVisible = false"
      @save="handleSave"
    >
      <div class="space-y-4">
        <div v-if="isUpdate" class="flex items-center gap-2">
          <span class="text-sm text-gray-600">Gallon ID:</span>
          <span>{{ selectedGallon.gallon_id }}</span>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Gallon Name:</label>
          <input
            v-model="selectedGallon.name"
            type="text"
            class="w-full border rounded-md px-3 py-2"
          />
        </div>

        <!-- 📤 Image Upload -->
        <div>
          <label class="block text-sm font-medium mb-1">Upload Image:</label>
          <input
            type="file"
            accept="image/*"
            @change="handleImageUpload"
            class="w-full border rounded-md px-3 py-2"
          />
        </div>

        <!-- Show Uploading Spinner -->
        <div v-if="uploading" class="flex justify-center items-center py-2">
          <div class="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <span class="ml-2 text-sm text-gray-600">Uploading...</span>
        </div>

        <!--Image Preview -->
        <div v-if="previewImage" class="flex justify-center mt-2">
          <img
            :src="previewImage"
            alt="Preview"
            class="w-24 h-24 object-cover rounded-full border border-gray-300 shadow-sm"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Size:</label>
          <input
            v-model="selectedGallon.size"
            type="text"
            class="w-full border rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Price:</label>
          <input
            v-model.number="selectedGallon.price"
            type="number"
            step="0.01"
            class="w-full border rounded-md px-3 py-2"
          />
        </div>
      </div>
    </Modal>
  </AdminLayout>
</template> 