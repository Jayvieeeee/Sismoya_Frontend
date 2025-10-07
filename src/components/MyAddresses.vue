<script setup lang="ts">
import { ref } from 'vue';
import AddNewAddressModal from '@components/AddNewAddressModal.vue';

interface Address {
  id: string;
  label: string;
  address: string;
  isDefault?: boolean;
}

const addresses = ref<Address[]>([
  {
    id: '1',
    label: 'Home',
    address: '145 Banal St. Bagong Barrio Caloocan City',
    isDefault: true
  },
  {
    id: '2',
    label: 'Office',
    address: 'University Of Caloocan City',
    isDefault: false
  }
]);

const showAddModal = ref(false);
const showEditModal = ref(false);
const editingAddress = ref<Address | null>(null);

const newAddress = ref({
  label: '',
  address: ''
});

function addNewAddress() {
  showAddModal.value = true;
}

function saveNewAddress() {
  if (newAddress.value.label && newAddress.value.address) {
    addresses.value.push({
      id: Date.now().toString(),
      label: newAddress.value.label,
      address: newAddress.value.address,
      isDefault: false
    });
    newAddress.value = { label: '', address: '' };
    showAddModal.value = false;
  }
}

function editAddress(address: Address) {
  editingAddress.value = { ...address };
  showEditModal.value = true;
}

function saveEditAddress() {
  if (editingAddress.value) {
    const index = addresses.value.findIndex(a => a.id === editingAddress.value!.id);
    if (index !== -1) {
      addresses.value[index] = { ...editingAddress.value };
    }
    showEditModal.value = false;
    editingAddress.value = null;
  }
}

function closeModal() {
  showAddModal.value = false;
  showEditModal.value = false;
  editingAddress.value = null;
  newAddress.value = { label: '', address: '' };
}

// Handle address added from the custom modal
function handleAddressAdded() {
  // Refresh addresses or perform any other action
  console.log('Address added from custom modal');
}
</script>

<template>
  <div class="pl-8">
    <h2 class="text-2xl font-bold mb-6">My Addresses</h2>
    
    <div class="max-w-xl space-y-4">
      <!-- Address Cards -->
      <div
        v-for="address in addresses"
        :key="address.id"
        class="border border-gray-300 rounded-xl p-4 relative hover:shadow-sm transition"
      >
        <!-- Edit Button -->
        <button
          @click="editAddress(address)"
          class="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>

        <h3 class="text-lg font-semibold mb-1">{{ address.label }}</h3>
        <p class="text-sm text-gray-700 mb-2">Address: {{ address.address }}</p>
        <span
          v-if="address.isDefault"
          class="text-xs font-medium text-gray-600"
        >
          Default
        </span>
      </div>

      <!-- Add New Address Button -->
      <button
        @click="addNewAddress"
        class="w-full border border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition font-medium"
      >
        + Add New Address
      </button>
    </div>

    <!-- Add Address Modal using custom component -->
    <AddNewAddressModal
      :isOpen="showAddModal"
      @close="closeModal"
      @address-added="handleAddressAdded"
    />

    <!-- Edit Address Modal -->
    <div
      v-if="showEditModal && editingAddress"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h3 class="text-xl font-semibold mb-4">Edit Address</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Label</label>
            <input
              v-model="editingAddress.label"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              v-model="editingAddress.address"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <div class="flex items-center">
            <input
              v-model="editingAddress.isDefault"
              type="checkbox"
              id="defaultCheck"
              class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label for="defaultCheck" class="ml-2 text-sm text-gray-700">Set as default</label>
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button
            @click="closeModal"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            @click="saveEditAddress"
            class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>