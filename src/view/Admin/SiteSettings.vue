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

// Get Image URL - SIMPLIFIED
const getImageUrl = (url: string) => {
  if (!url) return ''
  
  console.log('Original image URL:', url)
  
  // If it's already a full URL, return as is
  if (url.startsWith('http')) {
    return url
  }
  
  // If it starts with /images/, use as is with base URL
  if (url.startsWith('/images/')) {
    return `${IMAGE_BASE_URL}${url}`
  }
  
  // If it's just a filename without path, prepend /images/
  if (!url.includes('/')) {
    return `${IMAGE_BASE_URL}/images/${url}`
  }
  
  // Default: prepend base URL
  return `${IMAGE_BASE_URL}/${url}`
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
  
  console.log('Image selected:', file.name)
}

// Test if image exists
const testImageUrl = async (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = url
  })
}

// Get working image URL with fallback
const getWorkingImageUrl = async (url: string): Promise<string> => {
  if (!url) return ''
  
  const baseUrl = getImageUrl(url)
  
  // If URL already has an extension, try it first
  if (baseUrl.includes('.') && !baseUrl.endsWith('/')) {
    const exists = await testImageUrl(baseUrl)
    if (exists) return baseUrl
  }
  
  // Try different extensions
  const extensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif']
  for (const ext of extensions) {
    const testUrl = `${baseUrl}${ext}`
    const exists = await testImageUrl(testUrl)
    if (exists) {
      console.log(`Found image with extension ${ext}: ${testUrl}`)
      return testUrl
    }
  }
  
  // If no extension works, return the original URL
  console.log('No working extension found for:', baseUrl)
  return baseUrl
}

// Image component with smart loading
const SmartImage = ({ url, alt }: { url: string, alt: string }) => {
  const imageUrl = ref('')
  const imageError = ref(false)
  
  const loadImage = async () => {
    if (!url) {
      imageError.value = true
      return
    }
    
    const workingUrl = await getWorkingImageUrl(url)
    imageUrl.value = workingUrl
  }
  
  loadImage()
  
  return {
    imageUrl,
    imageError,
    onError: () => {
      imageError.value = true
      console.error('SmartImage: Failed to load', url)
    }
  }
}

// 💾 Save Gallon - FIXED UPLOAD
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
    // Prepare gallon data
    const gallonData = new FormData()
    gallonData.append('name', selectedGallon.name)
    gallonData.append('size', selectedGallon.size)
    gallonData.append('price', price.toString())
    
    // Add image if selected
    if (selectedFile.value) {
      gallonData.append('image', selectedFile.value)
    } else if (selectedGallon.image_url) {
      // If no new file but existing image URL, include it
      gallonData.append('image_url', selectedGallon.image_url)
    }

    console.log('Saving gallon data...')

    // Save gallon data
    if (isUpdate.value && selectedGallon.gallon_id) {
      await axiosInstance.put(`/gallons/${selectedGallon.gallon_id}`, gallonData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    } else {
      await axiosInstance.post('/gallons', gallonData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }

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

// Delete 
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

                    <!-- Image with smart loading -->
                    <td class="px-4 py-4 whitespace-nowrap">
                      <div v-if="gallon.image_url">
                        <!-- Use a simple img tag and let the browser handle it -->
                        <img
                          :src="getImageUrl(gallon.image_url)"
                          :alt="gallon.name"
                          class="w-14 h-14 object-cover rounded"
                          @error="(e) => {
                            console.error('Image failed to load:', gallon.image_url);
                            // Try without extension if it has one
                            const url = getImageUrl(gallon.image_url);
                            if (url.includes('.')) {
                              const baseUrl = url.substring(0, url.lastIndexOf('.'));
                              (e.target as HTMLImageElement).src = baseUrl;
                            } else {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }
                          }"
                          @load="() => console.log('Image loaded successfully:', gallon.image_url)"
                        />
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