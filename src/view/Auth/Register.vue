<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { registerUser } from "@/api/registerApi";
import LandingPageLayout from '@/Layout/LandingPageLayout.vue'

import gallonImg from '@/assets/images/gallon.png';


const router = useRouter();

// Form state
const firstName = ref("");
const lastName = ref("");
const username = ref("");
const email = ref("");
const password = ref("");
const contactNo = ref("");
const address = ref("");
const role = ref("user"); // default role

// Errors state
const errors = ref<Record<string, string>>({});

const handleRegister = async () => {
  errors.value = {}; // clear previous errors
  try {
    const payload = {
      first_name: firstName.value,
      last_name: lastName.value,
      username: username.value,
      email: email.value,
      password: password.value,
      contact_no: contactNo.value,
      address: address.value,
      role: role.value,
    };

    const res = await registerUser(payload);
    console.log("Registered:", res);
    alert("Registration successful!");
  } catch (err: any) {
    // If backend sends validation errors in a structured way
    if (err.response?.data?.errors) {
      errors.value = err.response.data.errors;
    } else {
      errors.value.general = err.response?.data?.message || "Registration failed";
    }
  }
};

function goToLogin() {
  router.push("/login");
}
</script>

<template>
  <LandingPageLayout>
  <section
    class="relative font-montserrat min-h-screen bg-gradient-to-b from-white to-secondary flex items-center justify-center py-10"
  >
    <div class="flex flex-col lg:flex-row items-center justify-center w-full max-w-6xl px-6 gap-10">
      <!-- Left section -->
      <div class="flex-1 text-center md:text-left">
        <h1 class="text-3xl md:text-5xl font-semibold text-primary mb-10">
          WELCOME TO <br />
          SISMOYA WATER!
        </h1>
       <img
        :src="gallonImg"
        alt="Water Jugs"
        class="w-full max-w-xs md:max-w-sm lg:max-w-sm mx-auto md:mx-0"
      />
      </div>

      <!-- Right section -->
      <div class="flex-1 flex justify-center mt-12">
        <div class="bg-white shadow-lg rounded-xl ml-36  p-8 sm:p-12 w-full max-w-sm">
          <h2 class="text-2xl font-medium text-center mb-6">Register</h2>

          <!-- name -->
          <div class="flex flex-col sm:flex-row gap-4 mb-6">
            <div class="w-full sm:w-1/2">
              <input
                v-model="firstName"
                type="text"
                placeholder="First Name"
                class="w-full px-4 py-2 bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <p
                v-if="errors.first_name"
                class="text-red-500 text-sm mt-1"
              >{{ errors.first_name }}</p>
            </div>
            <div class="w-full sm:w-1/2">
              <input
                v-model="lastName"
                type="text"
                placeholder="Last Name"
                class="w-full px-4 py-2 bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <p
                v-if="errors.last_name"
                class="text-red-500 text-sm mt-1"
              >{{ errors.last_name }}</p>
            </div>
          </div>

          <!-- email -->
          <div class="mb-4 relative">
            <input
              v-model="email"
              type="email"
              placeholder="Email"
              class="w-full pl-4 pr-4 py-2 bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <p v-if="errors.email" class="text-red-500 text-sm mt-1">{{ errors.email }}</p>
          </div>

          <!-- contact -->
          <div class="mb-4 relative">
            <input
              v-model="contactNo"
              type="text"
              placeholder="Contact No"
              class="w-full pl-4 pr-4 py-2 bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <p v-if="errors.contact_no" class="text-red-500 text-sm mt-1">{{ errors.contact_no }}</p>
          </div>

          <!-- username -->
          <div class="mb-4 relative">
            <input
              v-model="username"
              type="text"
              placeholder="Username"
              class="w-full pl-4 pr-4 py-2 bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <p v-if="errors.username" class="text-red-500 text-sm mt-1">{{ errors.username }}</p>
          </div>

          <!-- password -->
          <div class="mb-4 relative">
            <input
              v-model="password"
              type="password"
              placeholder="Password"
              class="w-full pl-4 pr-4 py-2 bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <p v-if="errors.password" class="text-red-500 text-sm mt-1">{{ errors.password }}</p>
          </div>

          <!-- general error -->
          <p v-if="errors.general" class="text-red-600 text-sm mb-3">{{ errors.general }}</p>

          <button
            @click="handleRegister"
            class="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-secondary transition"
          >
            Register
          </button>

            <p class="text-sm text-center md:text-right mt-4">
             Already have an account yet?
            <span
              @click="goToLogin"
              class="text-primary cursor-pointer hover:underline"
              >Login here</span
            >
          </p>
        </div>
      </div>
    </div>
  </section>

</LandingPageLayout>
</template>

