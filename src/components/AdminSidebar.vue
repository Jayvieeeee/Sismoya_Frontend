<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"
import { logout } from "@/utils/auth"
import Modal from "@/components/Modal.vue"

// ICONS
import dashboardIcon from "@/assets/icons/dashboard.png"
import customerIcon from "@/assets/icons/customer.png"
import riderIcon from "@/assets/icons/rider.png"
import orderHistoryIcon from "@/assets/icons/orderHistory.png"
import accountSettingsIcon from "@/assets/icons/accountSettings.png"
import logoutIcon from "@/assets/icons/logout.png"
import siteIcon from "@/assets/icons/site.png"

defineOptions({
  inheritAttrs: false,
})

interface MenuItem {
  name: string
  icon: string
  route: string | null
  bottom?: boolean
}

const router = useRouter()
const isOpen = ref(false)
const showConfirm = ref(false)

const menuItems: MenuItem[] = [
  { name: "Dashboard", icon: dashboardIcon, route: "/adminDashboard" },
  { name: "Orders", icon: orderHistoryIcon, route: "/adminOrders" },
  { name: "Customers", icon: customerIcon, route: "/customers" },
  { name: "Riders", icon: riderIcon, route: "/riders" },
  { name: "Gallons", icon: siteIcon, route: "/siteSettings" },
  { name: "Account Settings", icon: accountSettingsIcon, route: "/adminAccountSettings" },
  { name: "Logout", icon: logoutIcon, route: null, bottom: true },
]

async function navigateTo(item: MenuItem) {
  if (item.name === "Logout") {
    showConfirm.value = true
  } else if (item.route) {
    router.push(item.route)
    isOpen.value = false
  }
}

async function confirmLogout() {
  showConfirm.value = false
  const result = await logout()

  if (result.success) {
    setTimeout(() => {
      router.push("/login")
    }, 500)
  } else {
    console.error(result.message || "Logout failed.")
  }
}
</script>

<template>
  <div class="relative font-montserrat" v-bind="$attrs">
    <!-- Hamburger Button -->
    <button
      v-if="!isOpen"
      @click="isOpen = true"
      class="fixed top-4 left-4 z-50 bg-primary text-white p-2 rounded-md shadow-md md:hidden"
    >
      <img
        src="https://www.svgrepo.com/show/506800/burger-menu.svg"
        alt="Menu"
        class="w-6 h-6 invert"
      />
    </button>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed md:static top-0 left-0 h-full w-64 bg-primary text-white flex flex-col transform transition-transform duration-300 z-40',
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      ]"
    >
      <!-- Logo -->
      <div class="relative flex items-center justify-center px-6 py-2">
        <img
          src="/images/Sismoya_Logo.png"
          alt="Logo"
          class="h-14 mx-auto my-6"
        />

        <button
          @click="isOpen = false"
          class="absolute right-6 text-2xl font-bold text-white hover:text-gray-300 md:hidden"
        >
          ×
        </button>
      </div>

      <!-- Menu Items -->
      <nav class="flex-1 flex flex-col justify-between py-6">
        <div>
          <button
            v-for="item in menuItems.filter(i => !i.bottom)"
            :key="item.name"
            @click="navigateTo(item)"
            :class="[
              'flex items-center space-x-3 px-6 py-3 text-sm w-full text-left transition',
              router.currentRoute.value.path === item.route
                ? 'bg-[#246589]'
                : 'hover:bg-[#246589]'
            ]"
          >
            <img :src="item.icon" alt="" class="h-5 w-5 object-contain" />
            <span>{{ item.name }}</span>
          </button>
        </div>

        <div>
          <button
            v-for="item in menuItems.filter(i => i.bottom)"
            :key="item.name"
            @click="navigateTo(item)"
            class="flex items-center space-x-3 px-6 py-3 text-sm w-full text-left hover:bg-[#246589] transition"
          >
            <img :src="item.icon" alt="" class="h-5 w-5 object-contain" />
            <span>{{ item.name }}</span>
          </button>
        </div>
      </nav>
    </aside>

    <!-- Backdrop (mobile only) -->
    <div
      v-if="isOpen"
      @click="isOpen = false"
      class="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
    ></div>

    <!-- Confirm Modal -->
    <Modal
      :visible="showConfirm"
      title="Confirm Logout"
      @close="showConfirm = false"
    >
      <p class="text-gray-600">Are you sure you want to log out?</p>
      
      <template #actions>
        <button
          @click="showConfirm = false"
          class="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
        >
          Cancel
        </button>
        <button
          @click="confirmLogout"
          class="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition"
        >
          Logout
        </button>
      </template>
    </Modal>

  </div>
</template>

<style scoped>
body {
  overflow-x: hidden;
}
</style>