<script setup>
import AdminSidebar from '@/components/AdminSidebar.vue';
</script>


<template>
  <div class="h-screen flex font-montserrat overflow-hidden">
    <AdminSidebar />

  <main class="flex-1 h-screen overflow-hidden bg-white">
      <slot />
    </main>
  </div>
</template>


