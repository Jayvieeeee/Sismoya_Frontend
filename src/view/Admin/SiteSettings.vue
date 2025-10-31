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
    console.log('Backend response structure:', res.data)
    
    // Log each gallon's image data for debugging
    res.data.forEach((gallon: any) => {
      console.log(`Gallon ${gallon.gallon_id}:`, {
        name: gallon.name,
        image_url: gallon.image_url,
        image_url_length: gallon.image_url?.length,
        full_image_url: getImageUrl(gallon.image_url)
      })
    })
    
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
  Object.assign(selectedGallon, { ...gallon })
  previewImage.value = getImageUrl(gallon.image_url)
  selectedFile.value = null
  modalVisible.value = true
}

// FIXED: Correct Image URL function
const getImageUrl = (url: string) => {
  if (!url) return ''
  
  console.log('Original image URL from DB:', url)
  
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

  // Store the file for later upload
  selectedFile.value = file
  previewImage.value = URL.createObjectURL(file)
  
  console.log('Image selected:', {
    name: file.name,
    size: file.size,
    type: file.type
  })
}

// Save Gallon
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
  
  // Price validation
  const price = parseFloat(selectedGallon.price as string)
  if (!price || price <= 0 || isNaN(price)) {
    alert('Please enter a valid price.')
    return
  }

  uploading.value = true

  try {
    const formData = new FormData()
    formData.append('name', selectedGallon.name)
    formData.append('size', selectedGallon.size)
    formData.append('price', price.toString())
    
    // Add image if selected
    if (selectedFile.value) {
      formData.append('image', selectedFile.value)
    } else if (selectedGallon.image_url && isUpdate.value) {
      // For updates without new image, keep existing image_url
      formData.append('image_url', selectedGallon.image_url)
    }

    console.log('Saving gallon with data:', {
      name: selectedGallon.name,
      size: selectedGallon.size,
      price: price,
      hasFile: !!selectedFile.value,
      existingImage: selectedGallon.image_url,
      isUpdate: isUpdate.value
    })

    let result;
    if (isUpdate.value && selectedGallon.gallon_id) {
      result = await axiosInstance.put(`/gallons/${selectedGallon.gallon_id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    } else {
      result = await axiosInstance.post('/gallons', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }

    console.log('Save result:', result.data)

    modalVisible.value = false
    await fetchGallons()
    
  } catch (err: any) {
    console.error('Error saving gallon:', err)
    if (err.response?.data?.message) {
      alert('Failed to save gallon: ' + err.response.data.message)
    } else {
      alert('Failed to save gallon. Please try again.')
    }
  } finally {
    uploading.value = false
  }
}

// Delete Gallon
const handleDelete = async (gallon_id: number) => {
  if (!confirm('Are you sure you want to delete this gallon?')) return

  try {
    const res = await axiosInstance.delete(`/gallons/${gallon_id}`)

    if (res.data.success) {
      await fetchGallons()
    } else {
      alert(res.data.message || 'Delete failed.')
    }
  } catch (err: any) {
    console.error('Error deleting gallon:', err)
    alert('Failed to delete gallon.')
  }
}

// Image loading state management
const imageLoaded = ref<Record<number, boolean>>({})
const imageError = ref<Record<number, boolean>>({})

const handleImageLoad = (gallon_id: number) => {
  imageLoaded.value[gallon_id] = true
  imageError.value[gallon_id] = false
  console.log(`Image loaded successfully for gallon ${gallon_id}`)
}

const handleImageError = (gallon_id: number, url: string) => {
  imageLoaded.value[gallon_id] = false
  imageError.value[gallon_id] = true
  
  const gallon = gallons.value.find(g => g.gallon_id === gallon_id)
  console.error(`Image failed to load for gallon ${gallon_id}:`, {
    stored_url: gallon?.image_url,
    full_url: url,
    url_length: gallon?.image_url?.length,
    gallon_data: gallon
  })
}
</script>

<template>
  <AdminLayout>
    <div class="min-h-screen p-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl sm:text-3xl font-bold text-primary">Site Settings</h1>
      </div>

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
            <div class="overflow-auto max-h-[400px]">
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

                    <!-- Image with enhanced error handling -->
                    <td class="px-4 py-4 whitespace-nowrap">
                      <div v-if="gallon.image_url">
                        <img
                          :src="getImageUrl(gallon.image_url)"
                          :alt="gallon.name"
                          class="w-14 h-14 object-cover rounded"
                          @load="handleImageLoad(gallon.gallon_id)"
                          @error="handleImageError(gallon.gallon_id, getImageUrl(gallon.image_url))"
                        />
                        <div v-if="imageError[gallon.gallon_id]" class="text-red-500 text-xs italic mt-1">
                          Image not found
                        </div>
                        <div v-else-if="imageLoaded[gallon.gallon_id]" class="text-green-500 text-xs italic mt-1">
                          Loaded
                        </div>
                        <div v-else class="text-gray-400 text-xs italic mt-1">
                          Loading...
                        </div>
                      </div>
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

                        <!-- Delete Button -->
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

    <Modal
      :visible="modalVisible"
      :title="isUpdate ? 'Update Gallon' : 'Add Gallon'"
      @close="modalVisible = false"
      @save="handleSave"
    >
      <div class="space-y-4 text-left">
        <div v-if="isUpdate" class="flex items-center gap-2">
          <span class="text-sm text-gray-600">Gallon ID:</span>
          <span>{{ selectedGallon.gallon_id }}</span>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Gallon Name:</label>
          <input v-model="selectedGallon.name" type="text" class="w-full border rounded-md px-3 py-2" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Upload Image:</label>
          <input 
            type="file" 
            accept="image/jpeg, image/jpg, image/png, image/gif, image/webp" 
            @change="handleImageUpload" 
            class="w-full border rounded-md px-3 py-2" 
          />
          <p class="text-xs text-gray-500 mt-1">Supported formats: JPEG, PNG, GIF, WebP (Max: 5MB)</p>
        </div>

        <div v-if="uploading" class="flex justify-center items-center py-2">
          <div class="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <span class="ml-2 text-sm text-gray-600">Uploading...</span>
        </div>

        <div v-if="previewImage" class="flex justify-center mt-2">
          <img :src="previewImage" alt="Preview" class="w-24 h-24 object-cover rounded border border-gray-300 shadow-sm" />
        </div>

        <div v-if="selectedFile" class="text-xs text-green-600 bg-green-50 p-2 rounded">
          <p>File selected: {{ selectedFile.name }}</p>
          <p>File will be uploaded when you click Save</p>
        </div>

        <div v-if="selectedGallon.image_url && !selectedFile" class="text-xs text-blue-600 bg-blue-50 p-2 rounded">
          <p>Current image URL: {{ selectedGallon.image_url }}</p>
          <p>Full URL: {{ getImageUrl(selectedGallon.image_url) }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Size:</label>
          <input v-model="selectedGallon.size" type="text" class="w-full border rounded-md px-3 py-2" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Price:</label>
          <input v-model="selectedGallon.price" type="number" step="0.01" class="w-full border rounded-md px-3 py-2" />
        </div>
      </div>

      <template #actions>
        <button
          @click="modalVisible = false"
          class="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700"
        >
          Cancel
        </button>
        <button
          @click="handleSave"
          :disabled="uploading"
          class="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ uploading ? 'Uploading...' : 'Save' }}
        </button>
      </template>
    </Modal>
  </AdminLayout>
</template>