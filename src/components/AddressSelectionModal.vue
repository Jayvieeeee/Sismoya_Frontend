<script setup lang="ts">
interface Address {
  label: string
  full: string
  isDefault?: boolean
}

const props = defineProps<{
  isOpen: boolean
  addresses: Address[]
}>()

const emit = defineEmits<{
  (e: "close"): void
  (e: "select", address: Address): void
  (e: "add-new"): void
}>()

function selectAddress(address: Address) {
  emit("select", address)
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 font-montserrat"
  >
    <div
      class="bg-white rounded-xl shadow-lg py-5 px-8 w-[90%] max-w-[500px] max-h-[80vh] flex flex-col"
    >
      <!-- Header -->
      <div class="flex justify-between items-center mb-4">
        <h2
          class="text-lg font-semibold text-primary text-center w-full mb-3"
        >
          Address Selection
        </h2>
        <button
          @click="$emit('close')"
          class="text-gray-500 hover:text-red-500"
        >
          ✕
        </button>
      </div>

      <!-- Address List -->
      <div class="flex-1 overflow-y-auto pr-2 space-y-4">
        <div
          v-for="(address, index) in addresses"
          :key="index"
          @click="selectAddress(address)"
          class="px-4 py-3 rounded-lg border border-black cursor-pointer hover:bg-gray-100"
          :class="{ 'bg-gray-200': address.isDefault }"
        >
          <p class="text-xs font-semibold pb-1">{{ address.label }}</p>
          <p class="text-sm pb-1">Address: {{ address.full }}</p>
          <p
            v-if="address.isDefault"
            class="text-xs font-semibold"
          >
            Default
          </p>
        </div>
      </div>

      <!-- Add new address -->
      <button
        @click="$emit('add-new')"
        class="mt-4 w-full px-4 py-3 border border-black rounded-lg hover:bg-gray-100"
      >
        + Add New Address
      </button>
    </div>
  </div>
</template>
