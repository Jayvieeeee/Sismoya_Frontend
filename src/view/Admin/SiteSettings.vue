<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { PencilSquareIcon, PlusIcon, TrashIcon } from '@heroicons/vue/24/outline'
import AdminLayout from '@/Layout/AdminLayout.vue'
import Modal from '@/components/Modal.vue'
import axiosInstance from '@/utils/axios'
import { handleLogout } from '@/utils/auth'

const gallons = ref<any[]>([])
const loading = ref(true)
const error = ref<string | null>(null) 

const modalVisible = ref(false)
const isUpdate = ref(false)
const uploading = ref(false)
const selectedGallon = reactive({
  gallon_id: null as number | null,
  name: '',
  image_url: '',
  size: '',
  price: ''
})

const IMAGE_BASE_URL = 'https://sismoya.bsit3b.site/api'
const previewImage = ref<string | null>(null)
const selectedFile = ref<File | null>(null)

// Fetch Gallons
const fetchGallons = async () => {
  try {
    loading.value = true
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

// Open Add Modal
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
  selectedFile.value = null
  modalVisible.value = true
}

// Open Update Modal
const openUpdateModal = (gallon: any) => {
  isUpdate.value = true
  Object.assign(selectedGallon, { 
    ...gallon,
    price: parseFloat(gallon.price)
  })
  previewImage.value = getImageUrl(gallon.image_url)
  selectedFile.value = null
  modalVisible.value = true
}

// Image URL function
const getImageUrl = (url: string) => {
  if (!url) return ''
  
  // If it's already a full URL, return as is
  if (url.startsWith('http')) {
    return url
  }
  
  // Remove any leading/trailing slashes
  const cleanUrl = url.replace(/^\/+|\/+$/g, '')
  
  // If the URL already contains 'images/', use it directly
  if (cleanUrl.startsWith('images/')) {
    return `${IMAGE_BASE_URL}/${cleanUrl}`
  }
  
  // Otherwise, prepend 'images/'
  return `${IMAGE_BASE_URL}/images/${cleanUrl}`
}

// Upload Image
const handleImageUpload = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    alert('Please select a valid image file (JPEG, PNG, GIF, WebP).')
    return
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('Image size should be less than 5MB.')
    return
  }

  selectedFile.value = file
  previewImage.value = URL.createObjectURL(file)
}

// FIXED: Save Gallon - properly handles backend response
const handleSave = async () => {
  // Validation
  if (!selectedGallon.name.trim()) {
    alert('Please enter gallon name.')
    return
  }
  if (!selectedGallon.size.trim()) {
    alert('Please enter gallon size.')
    return
  }
  
  const price = parseFloat(selectedGallon.price as string)
  if (!price || price <= 0 || isNaN(price)) {
    alert('Please enter a valid price.')
    return
  }

  uploading.value = true

  try {
    const formData = new FormData()
    
    // Add regular form fields
    formData.append('name', selectedGallon.name)
    formData.append('size', selectedGallon.size)
    formData.append('price', price.toString())
    
    // Handle image properly
    if (selectedFile.value) {
      formData.append('image', selectedFile.value)
      console.log('Adding new image file')
    } else if (isUpdate.value && selectedGallon.image_url) {
      // For updates without new image, send the existing image URL
      formData.append('image_url', selectedGallon.image_url)
      console.log('Keeping existing image URL')
    }

    console.log('Sending update data...')

    let result;
    if (isUpdate.value && selectedGallon.gallon_id) {
      console.log(`🔄 UPDATING gallon ${selectedGallon.gallon_id}`)
      result = await axiosInstance.post(`/gallons/${selectedGallon.gallon_id}`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
        },
      })
    } else {
      console.log('🆕 CREATING new gallon')
      result = await axiosInstance.post('/gallons', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
        },
      })
    }

    console.log('Backend response:', result.data)

    // FIXED: Handle response and update local state
    if (result.data && result.data.success) {
      console.log('✅ Success! Gallon updated/created')
      
      // FIXED: If backend returns new image_url, update the selectedGallon
      if (result.data.image_url) {
        console.log('New image URL from backend:', result.data.image_url)
        selectedGallon.image_url = result.data.image_url
      }
      
      alert(`Gallon successfully ${isUpdate.value ? 'updated' : 'created'}!`)
      modalVisible.value = false
      
      // Reset file selection
      selectedFile.value = null
      previewImage.value = null
      
      await fetchGallons()
    } else {
      const errorMsg = result.data?.message || 'Operation failed. Please try again.'
      alert(errorMsg)
    }
    
  } catch (err: any) {
    console.error('❌ Error saving gallon:', err)
    
    if (err.response?.data?.message) {
      alert('Failed to save gallon: ' + err.response.data.message)
    } else if (err.response?.status === 500) {
      alert('Server error. Please check backend logs.')
    } else {
      alert('Failed to save gallon. Please try again.')
    }
  } finally {
    uploading.value = false
  }
}

// Delete Gallon
const handleDelete = async (gallon_id: number) => {
  const gallon = gallons.value.find(g => g.gallon_id === gallon_id)
  if (!gallon) return
  
  if (!confirm(`Are you sure you want to delete "${gallon.name}"?`)) return

  try {
    const res = await axiosInstance.delete(`/gallons/${gallon_id}`)

    if (res.data.success) {
      alert(`"${gallon.name}" has been deleted successfully.`)
      await fetchGallons()
    } else {
      alert(res.data.message || 'Delete failed.')
    }
  } catch (err: any) {
    console.error('Error deleting gallon:', err)
    alert('Failed to delete gallon. Please try again.')
  }
}

// Clear image selection
const clearImage = () => {
  selectedFile.value = null
  previewImage.value = isUpdate.value && selectedGallon.image_url 
    ? getImageUrl(selectedGallon.image_url) 
    : null
}
</script>

<template>
  <AdminLayout>
    <div class="min-h-screen p-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl sm:text-3xl font-bold text-primary">Site Settings</h1>
      </div>

      <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div class="p-8">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-gray-800">Gallon Details</h2>
            <button
              @click="openAddModal"
              class="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition text-sm"
            >
              <PlusIcon class="w-4 h-4" />
              <span>Add New Gallon</span>
            </button>
          </div>

          <div v-if="loading" class="text-gray-500">Loading gallons...</div>
          <div v-else-if="error" class="text-red-500">Error: {{ error }}</div>

          <div v-else class="rounded-lg overflow-hidden">
            <div class="overflow-auto max-h-[400px]">
              <table class="min-w-full text-sm">
                <thead class="sticky top-0 bg-white z-10">
                  <tr class="border-b border-gray-200">
                    <th class="px-4 py-3 text-left text-gray-600 font-medium">ID</th>
                    <th class="px-4 py-3 text-left text-gray-600 font-medium">Image</th>
                    <th class="px-4 py-3 text-left text-gray-600 font-medium">Name</th>
                    <th class="px-4 py-3 text-left text-gray-600 font-medium">Size</th>
                    <th class="px-4 py-3 text-left text-gray-600 font-medium">Price</th>
                    <th class="px-4 py-3 text-center text-gray-600 font-medium">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  <tr
                    v-for="gallon in gallons"
                    :key="gallon.gallon_id"
                    class="border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <td class="px-4 py-4 text-gray-700">{{ gallon.gallon_id }}</td>
                    <td class="px-4 py-4">
                      <div v-if="gallon.image_url">
                        <img
                          :src="getImageUrl(gallon.image_url)"
                          :alt="gallon.name"
                          class="w-14 h-14 object-cover rounded border"
                        />
                      </div>
                      <span v-else class="text-gray-400 text-xs italic">No image</span>
                    </td>
                    <td class="px-4 py-4 text-gray-700 font-medium">{{ gallon.name }}</td>
                    <td class="px-4 py-4 text-gray-700">{{ gallon.size }}</td>
                    <td class="px-4 py-4 text-gray-700 font-semibold">₱{{ parseFloat(gallon.price).toFixed(2) }}</td>
                    <td class="px-4 py-4">
                      <div class="flex justify-center gap-2">
                        <button
                          @click="openUpdateModal(gallon)"
                          class="p-2 rounded-lg hover:bg-blue-50 transition"
                          :title="`Edit ${gallon.name}`"
                        >
                          <PencilSquareIcon class="w-5 h-5 text-blue-600" />
                        </button>
                        <button
                          @click="handleDelete(gallon.gallon_id)"
                          class="p-2 rounded-lg hover:bg-red-50 transition"
                          :title="`Delete ${gallon.name}`"
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

    <Modal
      :visible="modalVisible"
      :title="isUpdate ? `Update Gallon #${selectedGallon.gallon_id}` : 'Add New Gallon'"
      @close="modalVisible = false"
      @save="handleSave"
    >
      <div class="space-y-4 text-left">
        <div v-if="isUpdate" class="text-sm text-gray-600 bg-blue-50 p-2 rounded">
          Editing Gallon ID: <span class="font-bold">{{ selectedGallon.gallon_id }}</span>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Gallon Name:</label>
          <input 
            v-model="selectedGallon.name" 
            type="text" 
            class="w-full border rounded-md px-3 py-2" 
            placeholder="Enter gallon name"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">
            {{ isUpdate ? 'Change Image:' : 'Upload Image:' }}
          </label>
          <input 
            type="file" 
            accept="image/jpeg, image/jpg, image/png, image/gif, image/webp" 
            @change="handleImageUpload" 
            class="w-full border rounded-md px-3 py-2" 
          />
          <p class="text-xs text-gray-500 mt-1">Supported formats: JPEG, PNG, GIF, WebP (Max: 5MB)</p>
          
          <div v-if="selectedFile" class="mt-2">
            <button 
              @click="clearImage"
              class="text-xs text-red-600 hover:text-red-800 underline"
            >
              Remove selected image
            </button>
          </div>
        </div>

        <div v-if="uploading" class="flex justify-center items-center py-2 bg-blue-50 rounded">
          <div class="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <span class="ml-2 text-sm text-blue-600">{{ isUpdate ? 'Updating...' : 'Creating...' }}</span>
        </div>

        <div v-if="previewImage" class="border rounded-lg p-4 bg-gray-50">
          <label class="block text-sm font-medium mb-2">Image Preview:</label>
          <div class="flex justify-center">
            <img :src="previewImage" alt="Preview" class="w-32 h-32 object-cover rounded border-2 border-gray-300" />
          </div>
          <p class="text-xs text-center text-gray-500 mt-2">
            {{ selectedFile ? 'New image to be uploaded' : 'Current image' }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Size:</label>
          <input 
            v-model="selectedGallon.size" 
            type="text" 
            class="w-full border rounded-md px-3 py-2" 
            placeholder="e.g., 5 gallons, 10L, etc."
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Price (₱):</label>
          <input 
            v-model="selectedGallon.price" 
            type="number" 
            step="0.01" 
            min="0"
            class="w-full border rounded-md px-3 py-2" 
            placeholder="0.00"
          />
        </div>
      </div>

      <template #actions>
        <button
          @click="modalVisible = false"
          class="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700 transition"
        >
          Cancel
        </button>
        <button
          @click="handleSave"
          :disabled="uploading"
          class="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white disabled:opacity-50 transition"
        >
          {{ uploading ? (isUpdate ? 'Updating...' : 'Creating...') : (isUpdate ? 'Update Gallon' : 'Create Gallon') }}
        </button>
      </template>
    </Modal>
  </AdminLayout>
</template>