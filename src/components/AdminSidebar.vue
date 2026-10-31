<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"
import { logout } from "@/utils/auth"
import Modal from "@/components/Modal.vue"

// ICONS
import dashboardIcon from "@/assets/icons/dashboard.png"
import customerIcon from "@/assets/icons/customer.png"
import riderIcon from "@/assets/icons/delivery-bike.png"
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
  { name: "Delivery Boy", icon: riderIcon, route: "/riders" },
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
      class="fixed top-4 left-4 z-50 bg-white text-gray-700 p-2 rounded-md shadow-md border border-gray-200 md:hidden"
    >
      <img
        src="https://www.svgrepo.com/show/506800/burger-menu.svg"
        alt="Menu"
        class="w-5 h-5"
      />
    </button>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed md:relative top-0 left-0 h-full w-64 bg-white text-gray-700 border-r border-gray-100 flex flex-col transform transition-transform duration-300 z-40',
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      ]"
    >
      <!-- Logo -->
      <div class="relative flex items-center gap-2 px-6 py-5 border-b border-gray-100">
        <img
          src="/images/Sismoya_Logo.png"
          alt="Logo"
          class="h-7 w-7 object-contain"
        />
        <span class="text-sm font-bold tracking-wide text-gray-800">SISMOYA</span>

        <button
          @click="isOpen = false"
          class="absolute right-6 text-2xl font-bold text-gray-400 hover:text-gray-600 md:hidden"
        >
          ×
        </button>
      </div>

      <!-- Menu Items -->
      <nav class="flex-1 flex flex-col justify-between py-4 overflow-y-auto">
        <div class="space-y-1 px-3">
          <button
            v-for="item in menuItems.filter(i => !i.bottom)"
            :key="item.name"
            @click="navigateTo(item)"
            :class="[
              'flex items-center space-x-3 px-4 py-2.5 text-sm w-full text-left transition rounded-lg',
              router.currentRoute.value.path === item.route
                ? 'bg-blue-50 text-blue-600 font-semibold'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            ]"
          >
            <img
              :src="item.icon"
              alt=""
              :class="[
                'h-5 w-5 object-contain transition icon-black',
                router.currentRoute.value.path === item.route ? 'opacity-100' : 'opacity-50'
              ]"
            />
            <span>{{ item.name }}</span>
          </button>
        </div>

        <div class="px-3 pt-3 mt-3 border-t border-gray-100 space-y-1">
          <button
            v-for="item in menuItems.filter(i => i.bottom)"
            :key="item.name"
            @click="navigateTo(item)"
            class="flex items-center space-x-3 px-4 py-2.5 text-sm w-full text-left text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition rounded-lg"
          >
            <img :src="item.icon" alt="" class="h-5 w-5 object-contain icon-black opacity-50" />
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
.icon-black {
  filter: brightness(0);
}
</style>