<script setup>
import Navbar from '@components/LandingNavbar.vue'
import Footer from '@components/LandingFooter.vue'
</script>


<template>
  <div class="min-h-screen flex flex-col font-montserrat">
    <!-- Navbar -->
    <Navbar />

    <!-- Page content -->
    <main class="flex-grow">
      <slot />
    </main>

    <!-- Footer -->
    <Footer />
  </div>
</template>


