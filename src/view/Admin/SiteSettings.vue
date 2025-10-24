<script setup lang="ts">
import { ref } from 'vue'
import AdminLayout from '@/Layout/AdminLayout.vue'
import TabNavigation from '@/view/Admin/SiteSettingsTab.vue'
import GeneralInformation from '@/components/GeneralInformation.vue'
import GallonDetails from '@/components/GallonDetails.vue'

const activeTab = ref('general-info')

const tabs = [
  { id: 'general-info', label: 'General Information' },
  { id: 'gallon-details', label: 'Gallon Details' },
]
</script>

<template>
  <AdminLayout>
    <div class="min-h-screen p-4 md:p-8">
      <!-- Page Header -->
      <div class="max-w-5xl mx-auto mb-6">
        <h2 class="text-2xl md:text-3xl font-bold text-primary">Site Settings</h2>
      </div>

      <!-- Main Container -->
      <div class="flex justify-center">
        <div class="bg-white rounded-3xl border-2 p-6 w-full max-w-5xl">
          <div class="flex flex-col md:flex-row gap-4 md:gap-0">
            <!-- Sidebar Tabs -->
            <div class="w-full md:w-60 flex-shrink-0">
              <TabNavigation
                :tabs="tabs"
                :activeTab="activeTab"
                @update:activeTab="activeTab = $event"
              />
            </div>

            <!-- Dynamic Content -->
            <div class="flex-1 px-4">
              <GeneralInformation v-if="activeTab === 'general-info'" />
              <GallonDetails v-else-if="activeTab === 'gallon-details'" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
