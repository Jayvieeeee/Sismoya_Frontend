<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue"
import { useRouter } from "vue-router"

const router = useRouter()
const isOpen = ref(false)
const activeSection = ref("")

const navItems = [
  { name: "Home", route: "/#home" },
  { name: "Services", route: "/#services" },
  { name: "Contact Us", route: "/#contact" },
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
  <nav class="fixed top-0 left-0 w-full z-50 font-montserrat bg-primary shadow-md px-8">
    <div class="flex justify-between items-center h-16">
      <!-- Logo -->
      <div class="ml-4 flex items-center">
        <img src="/images/Sismoya_Logo.png" alt="Sismoya Logo" class="h-12 w-auto" />
      </div>

      <!-- Desktop Menu -->
      <ul class="hidden md:flex space-x-8 text-white font-medium text-sm items-center pr-10">
        <li v-for="item in navItems" :key="item.name">
          <button
            @click="navigateTo(item.route)"
            :class="[
              item.isButton
                ? isActive(item)
                  ? 'bg-white text-black font-semibold px-3 py-2 rounded-full'
                  : 'border-2 border-white px-3 py-2 rounded-full hover:bg-white hover:text-black transition'
                : isActive(item)
                  ? 'bg-white text-black font-semibold px-3 py-2 rounded-full'
                  : 'px-3 py-2 rounded-full hover:bg-white hover:text-black transition'
            ]"
          >
            {{ item.name }}
          </button>
        </li>
      </ul>

      <!-- Mobile Hamburger -->
      <button @click="isOpen = !isOpen" class="md:hidden text-white focus:outline-none pr-2">
        <svg
          v-if="!isOpen"
          class="w-8 h-8"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <svg
          v-else
          class="w-8 h-8"
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
        class="md:hidden flex flex-col bg-primary text-white font-medium text-sm p-4 space-y-4"
      >
        <li v-for="item in navItems" :key="item.name">
          <button
            @click="navigateTo(item.route)"
            :class="[
              item.isButton
                ? isActive(item)
                  ? 'bg-white text-black font-semibold w-full py-2 rounded-full'
                  : 'border-2 border-white w-full py-2 rounded-full hover:bg-white hover:text-black transition'
                : isActive(item)
                  ? 'bg-white text-black font-semibold w-full py-2 rounded-full'
                  : 'w-full py-2 rounded-full hover:bg-white hover:text-black transition'
            ]"
          >
            {{ item.name }}
          </button>
        </li>
      </ul>
    </transition>
  </nav>
</template>
