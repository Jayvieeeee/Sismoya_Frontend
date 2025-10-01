<script setup lang="ts">
import { ref, onMounted } from "vue";
import Sidebar from "@/components/CustomerSidebar.vue";
import gallonImg from "@/assets/images/Dashboard_img.png";
import { getProfile } from "@/utils/auth";

// Store the whole user object
interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  contact_no: string;
  role: string;
}

const user = ref<User | null>(null);

onMounted(async () => {
  try {
    const profile = await getProfile();
    user.value = profile; // backend should return { user: { ... } }
  } catch (err) {
    console.error("Profile load failed:", err);
    user.value = null;
  }
});
</script>

<template>
  <div
    class="flex h-screen font-montserrat bg-gradient-to-b from-white to-secondary"
  >
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Content -->
    <div class="flex-1 p-6 mx-12">
      <!-- Title -->
      <h1 class="text-3xl font-bold text-primary mb-4">Sismoya Water</h1>

      <!-- Welcome message -->
      <p class="text-lg mb-6 font-semibold">
        Welcomee,
        <span v-if="user"> {{ user.first_name }} {{ user.last_name }} </span>
        <span v-else> </span>
      </p>

      <!-- Gallon Image in White Box -->
      <div
        class="bg-white rounded-xl shadow-md flex justify-center items-center p-6 mb-8"
      >
        <img :src="gallonImg" alt="Water Gallons" class="h-48 object-contain" />
      </div>

      <!-- Stats Section -->
      <div class="grid grid-cols-4 gap-6 mb-8">
        <div class="bg-white shadow rounded-xl p-6 text-center">
          <p class="text-xl font-bold">1</p>
          <p class="text-gray-500">Pending Orders</p>
        </div>
        <div class="bg-white shadow rounded-xl p-6 text-center">
          <p class="text-xl font-bold">23</p>
          <p class="text-gray-500">Completed Orders</p>
        </div>
        <div class="bg-white shadow rounded-xl p-6 text-center">
          <p class="text-xl font-bold">1</p>
          <p class="text-gray-500">Cancelled Orders</p>
        </div>
        <div class="bg-white shadow rounded-xl p-6 text-center">
          <p class="text-xl font-bold">25</p>
          <p class="text-gray-500">Total Orders</p>
        </div>
      </div>

      <!-- Orders Table -->
      <div class="bg-white shadow rounded-xl p-6">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b">
              <th class="py-2 px-4">Order ID</th>
              <th class="py-2 px-4">Order</th>
              <th class="py-2 px-4">Total Amount</th>
              <th class="py-2 px-4">Date</th>
              <th class="py-2 px-4">Status</th>
              <th class="py-2 px-4">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b">
              <td class="py-2 px-4">1</td>
              <td class="py-2 px-4">Round Gallon 2x</td>
              <td class="py-2 px-4">₱80.00</td>
              <td class="py-2 px-4">11-10-2025</td>
              <td class="py-2 px-4 text-green-600">Completed</td>
              <td class="py-2 px-4 text-blue-500 cursor-pointer">
                View Details
              </td>
            </tr>
            <tr class="border-b">
              <td class="py-2 px-4">2</td>
              <td class="py-2 px-4">Round Gallon 1x</td>
              <td class="py-2 px-4">₱40.00</td>
              <td class="py-2 px-4">11-10-2025</td>
              <td class="py-2 px-4 text-green-600">Completed</td>
              <td class="py-2 px-4 text-blue-500 cursor-pointer">
                View Details
              </td>
            </tr>
            <tr>
              <td class="py-2 px-4">3</td>
              <td class="py-2 px-4">Round Gallon 3x</td>
              <td class="py-2 px-4">₱120.00</td>
              <td class="py-2 px-4">11-11-2025</td>
              <td class="py-2 px-4 text-green-600">Completed</td>
              <td class="py-2 px-4 text-blue-500 cursor-pointer">
                View Details
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
