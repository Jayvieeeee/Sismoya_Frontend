<script setup lang="ts">
import { PencilSquareIcon, PlusIcon } from '@heroicons/vue/24/outline'

// Static data (for now)
const gallons = [
  { id: 1, name: 'Slim Gallon', image: '/images/slim.png', size: '30L', price: '30.00' },
  { id: 2, name: 'Round Gallon', image: '/images/round.png', size: '30L', price: '30.00' },
  { id: 3, name: 'Mini Gallon', image: '/images/mini.png', size: '15L', price: '30.00' },
]
</script>

<template>
  <div class="flex flex-col space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-800">Gallon Details</h3>
      <button
        class="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition"
      >
        <PlusIcon class="w-5 h-5" />
        <span>Add</span>
      </button>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full border border-gray-300 rounded-lg overflow-hidden text-sm text-gray-700">
        <thead class="bg-gray-100 text-gray-700">
          <tr>
            <th class="px-4 py-3 border-b text-left">Gallon ID</th>
            <th class="px-4 py-3 border-b text-left">Gallon Name</th>
            <th class="px-4 py-3 border-b text-left">Image</th>
            <th class="px-4 py-3 border-b text-left">Size</th>
            <th class="px-4 py-3 border-b text-left">Price</th>
            <th class="px-4 py-3 border-b text-center">Action</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="gallon in gallons"
            :key="gallon.id"
            class="hover:bg-gray-50 transition"
          >
            <td class="px-4 py-3 border-b">{{ gallon.id }}</td>
            <td class="px-4 py-3 border-b">{{ gallon.name }}</td>
            <td class="px-4 py-3 border-b">
              <img
                :src="gallon.image"
                alt="Gallon Image"
                class="w-8 h-8 object-contain"
              />
            </td>
            <td class="px-4 py-3 border-b">{{ gallon.size }}</td>
            <td class="px-4 py-3 border-b">₱{{ gallon.price }}</td>
            <td class="px-4 py-3 border-b text-center">
              <button
                class="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition"
              >
                <PencilSquareIcon class="w-5 h-5 text-blue-600" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
