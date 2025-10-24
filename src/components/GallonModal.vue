<template>
  <Modal
    :visible="show"
    :title="isUpdate ? 'Update Gallon' : 'Add Gallon'"
    @close="show = false"
    @save="handleSave"
  >
    <div class="space-y-4">
      <div v-if="isUpdate" class="flex items-center space-x-2">
        <span class="text-sm text-gray-600">Gallon ID:</span>
        <span>{{ gallon.id }}</span>
      </div>

      <div>
        <label class="block text-sm font-medium">Gallon Name:</label>
        <input
          v-model="gallon.name"
          type="text"
          class="w-full border rounded-md px-3 py-2"
        />
      </div>

      <div>
        <label class="block text-sm font-medium">Image URL:</label>
        <input
          v-if="isUpdate"
          v-model="gallon.image"
          type="text"
          class="w-full border rounded-md px-3 py-2"
        />
        <input
          v-else
          type="file"
          @change="uploadImage"
          class="w-full border rounded-md px-3 py-2"
        />
      </div>

      <div>
        <label class="block text-sm font-medium">Size:</label>
        <input
          v-model="gallon.size"
          type="text"
          class="w-full border rounded-md px-3 py-2"
        />
      </div>

      <div>
        <label class="block text-sm font-medium">Price:</label>
        <input
          v-model="gallon.price"
          type="number"
          class="w-full border rounded-md px-3 py-2"
        />
      </div>
    </div>
  </Modal>
</template>

<script setup>
import Modal from './Modal.vue'

const props = defineProps({
  show: Boolean,
  isUpdate: Boolean,
  gallonData: {
    type: Object,
    default: () => ({ name: '', image: '', size: '', price: '' }),
  },
})

const emits = defineEmits(['update:show', 'save'])

const show = computed({
  get: () => props.show,
  set: (val) => emits('update:show', val),
})

const gallon = reactive({ ...props.gallonData })

const uploadImage = (e) => {
  const file = e.target.files[0]
  if (file) gallon.image = file.name
}

const handleSave = () => {
  emits('save', { ...gallon })
  show.value = false
}
</script>
