<script setup>
import droplet from "@/assets/icons/droplet.png"
</script>

<template>
  <footer class="bg-white border-t border-gray-200 font-montserrat py-5 px-6">
    <div class="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">

      <!-- Left: Logo + name -->
      <div class="flex items-center gap-2">
        <img :src="droplet" alt="Sismoya Water" class="h-6 w-6" />
        <span class="text-sm font-bold text-gray-900">Sismoya Water</span>
      </div>

      <!-- Center: Copyright -->
      <p class="text-xs text-gray-400 order-3 md:order-2">
        © 2025 Sismoya Water. All rights reserved.
      </p>

      <!-- Right: Links -->
      <div class="flex items-center gap-6 order-2 md:order-3">
        <a href="#" class="text-xs text-gray-500 hover:text-primary transition">Privacy Policy</a>
        <a href="#" class="text-xs text-gray-500 hover:text-primary transition">Terms of Service</a>
        <a href="#" class="text-xs text-gray-500 hover:text-primary transition">Download App</a>
      </div>

    </div>
  </footer>
</template>