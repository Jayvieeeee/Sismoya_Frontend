<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue"
import { useRouter } from "vue-router"
import logo from "@/assets/images/new_logo.png"

const router = useRouter()
const isOpen = ref(false)
const activeSection = ref("")

const navItems = [
  { name: "Home", route: "/#home" },
  { name: "Services", route: "/#services" },
  { name: "Contact Us", route: "/#contact" },
  { name: "Download App", route: "/#download" },
  { name: "Login", route: "/login", isButton: true },
]

function navigateTo(route: string) {
  isOpen.value = false
  if (route.includes("#")) {
    router.push(route).then(() => {
      const hash = route.split("#")[1]
      const el = document.getElementById(hash)
      if (el) {
        el.scrollIntoView({ behavior: "smooth" })
      }
    })
  } else {
    router.push(route)
  }
}

function isActive(item: { route: string; isButton?: boolean }) {
  if (item.isButton) return router.currentRoute.value.path === item.route
  if (item.route.includes("#")) {
    const hash = item.route.split("#")[1]
    return activeSection.value === hash
  }
  return router.currentRoute.value.fullPath === item.route
}

function handleScroll() {
  const sections = document.querySelectorAll("section[id]")
  let current = ""

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect()
    const topOffset = window.scrollY + rect.top
    if (window.scrollY >= topOffset - 200) {
      current = section.getAttribute("id") || ""
    }
  })

  if (current) activeSection.value = current
}

onMounted(() => {
  window.addEventListener("scroll", handleScroll)
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll)
})
</script>

<template>
  <nav class="fixed top-0 left-0 w-full z-50 font-montserrat bg-white border-b border-gray-100 shadow-sm px-8">
    <div class="flex justify-between items-center h-16">
      <!-- Logo -->
      <div class="flex items-center gap-2">
        <img :src="logo" alt="Sismoya Logo" class="h-7 w-auto" />
        <span class="text-gray-900 font-semibold text-sm tracking-wide">SISMOYA</span>
      </div>

      <!-- Desktop Menu -->
      <ul class="hidden md:flex space-x-8 text-gray-600 font-medium text-sm items-center">
        <li v-for="item in navItems.filter(i => !i.isButton)" :key="item.name">
          <button
            @click="navigateTo(item.route)"
            :class="[
              'transition-colors',
              isActive(item) ? 'text-gray-900 font-semibold' : 'hover:text-gray-900'
            ]"
          >
            {{ item.name }}
          </button>
        </li>
        <li v-for="item in navItems.filter(i => i.isButton)" :key="item.name">
          <button
            @click="navigateTo(item.route)"
            :class="[
              'px-5 py-2 rounded-full text-sm font-medium border transition-colors',
              isActive(item)
                ? 'bg-gray-900 text-white border-gray-900'
                : 'border-gray-300 text-gray-900 hover:bg-gray-900 hover:text-white hover:border-gray-900'
            ]"
          >
            {{ item.name }}
          </button>
        </li>
      </ul>

      <!-- Mobile Hamburger -->
      <button @click="isOpen = !isOpen" class="md:hidden text-gray-900 focus:outline-none">
        <svg
          v-if="!isOpen"
          class="w-7 h-7"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <svg
          v-else
          class="w-7 h-7"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Mobile Dropdown -->
    <transition name="slide-fade">
      <ul
        v-if="isOpen"
        class="md:hidden flex flex-col bg-white border-t border-gray-100 text-gray-700 font-medium text-sm p-4 space-y-3"
      >
        <li v-for="item in navItems.filter(i => !i.isButton)" :key="item.name">
          <button
            @click="navigateTo(item.route)"
            :class="[
              'w-full text-left py-2',
              isActive(item) ? 'text-gray-900 font-semibold' : 'hover:text-gray-900'
            ]"
          >
            {{ item.name }}
          </button>
        </li>
        <li v-for="item in navItems.filter(i => i.isButton)" :key="item.name">
          <button
            @click="navigateTo(item.route)"
            :class="[
              'w-full py-2 rounded-full text-sm font-medium border transition-colors',
              isActive(item)
                ? 'bg-gray-900 text-white border-gray-900'
                : 'border-gray-300 text-gray-900 hover:bg-gray-900 hover:text-white hover:border-gray-900'
            ]"
          >
            {{ item.name }}
          </button>
        </li>
      </ul>
    </transition>
  </nav>
</template>