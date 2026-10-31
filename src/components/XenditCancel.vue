<script setup lang="ts">
import { useRouter } from "vue-router"
const router = useRouter()
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <p class="text-lg font-semibold">Payment cancelled</p>
      <p class="mt-2">Your order was saved but not paid. You can pay for it again from your orders.</p>
      <button class="mt-6 bg-primary text-white px-6 py-2 rounded-full" @click="router.push('/customerContainer')">
        Back to orders
      </button>
    </div>
  </div>
</template>