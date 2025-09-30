<script setup lang="ts">
import { useRouter } from "vue-router"
import { logout } from "@/utils/auth"

import dashboardIcon from "@/assets/icons/dashboard.png"
import containerIcon from "@/assets/icons/container.png"
import orderHistoryIcon from "@/assets/icons/orderHistory.png"
import accountSettingsIcon from "@/assets/icons/accountSettings.png"
import logoutIcon from "@/assets/icons/logout.png"

// ------------------ Types ------------------
interface MenuItem {
  name: string
  icon: string
  route: string | null
  bottom?: boolean
}

const router = useRouter()

// ------------------ Menu Items ------------------
const menuItems: MenuItem[] = [
  { name: "Dashboard", icon: dashboardIcon, route: "/customerDashboard" },
  { name: "Gallon", icon: containerIcon, route: "/customerContainer" },
  { name: "Orders", icon: orderHistoryIcon, route: "/orders" },
  { name: "Account Settings", icon: accountSettingsIcon, route: "/settings" },
  { name: "Logout", icon: logoutIcon, route: null, bottom: true },
]

// ------------------ Navigation ------------------
async function navigateTo(item: MenuItem) {
  if (item.name === "Logout") {
    const result = await logout()
    if (result.success) {
      alert(result.message)
      router.push("/login")
    } else {
      alert(result.message)
    }
  } else if (item.route) {
    router.push(item.route)
  }
}
</script>

<template>
  <aside class="bg-primary text-white w-60 h-screen flex flex-col">
    <!-- Logo -->
    <div class="flex items-center justify-center my-12">
      <img src="/images/Sismoya_Logo.png" alt="Logo" class="h-16" />
    </div>

    <!-- Top Menu -->
    <nav class="flex-1 flex flex-col">
      <button
        v-for="item in menuItems.filter(i => !i.bottom)"
        :key="item.name"
        @click="navigateTo(item)"
        :class="[
          'flex items-center space-x-3 px-6 py-3 text-sm w-full text-left not-italic font-normal',
          router.currentRoute.value.path === item.route
            ? 'bg-[#246589]'
            : 'hover:bg-[#246589]'
        ]"
      >
        <img :src="item.icon" alt="" class="h-5 w-5 object-contain" />
        <span>{{ item.name }}</span>
      </button>
    </nav>

    <!-- Bottom Menu (Logout) -->
    <nav class="flex flex-col">
      <button
        v-for="item in menuItems.filter(i => i.bottom)"
        :key="item.name"
        @click="navigateTo(item)"
        class="flex items-center space-x-3 px-8 py-3 mb-12 text-sm w-full text-left not-italic font-normal hover:bg-[#246589]"
      >
        <img :src="item.icon" alt="" class="h-5 w-5 object-contain" />
        <span>{{ item.name }}</span>
      </button>
    </nav>
  </aside>
</template>
