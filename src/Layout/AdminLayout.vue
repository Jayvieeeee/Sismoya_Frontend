<script setup>
import AdminSidebar from '@/components/AdminSidebar.vue';
</script>


<template>
  <div class="h-screen flex font-montserrat overflow-hidden">
    <AdminSidebar />

    <main class="flex-1 overflow-y-auto bg-gradient-to-b from-white to-secondary p-6">
      <slot />
    </main>
  </div>
</template>


