<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const navItems = [
  { name: 'Home', route: '/' },
  { name: 'Services', route: '/#services' },
  { name: 'Contact Us', route: '/#contact' },
  { name: 'Download App', route: '/#download-app' },
  { name: 'Login', route: '/login', isButton: true },
]

function navigateTo(route: string) {
  if (route.includes('#')) {
    const [path, hash] = route.split('#')
    router.push(path || '/').then(() => {
      const el = document.getElementById(hash)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    })
  } else {
    router.push(route)
  }
}
</script>

<template>
  <nav
    class="fixed top-0 left-0 w-full z-50 font-montserrat bg-black shadow-md px-6 flex justify-between items-center"
  >
    <!-- Logo -->
    <div class="ml-8 flex items-center h-14">
      <img src="/images/Sismoya_Logo.png" alt="Sismoya Logo" class="h-10 w-auto" />
    </div>

    <!-- Navigation Items -->
    <ul class="flex space-x-12 text-white font-medium text-sm items-center pr-5">
      <li v-for="item in navItems" :key="item.name">
        <button
          @click="navigateTo(item.route)"
          :class="[
            item.isButton
              ? router.currentRoute.value.path === item.route
                ? 'bg-white text-black font-semibold px-5 py-2 rounded-full'
                : 'border-2 border-white px-6 py-2 rounded-full hover:bg-white hover:text-black transition'
              : router.currentRoute.value.fullPath === item.route
                ? 'bg-white text-black font-semibold px-3 py-2 rounded-full'
                : 'px-3 py-2 rounded-full hover:bg-white hover:text-black transition'
          ]"
        >
          {{ item.name }}
        </button>
      </li>
    </ul>
  </nav>
</template>
