<script setup lang="ts">
import { ref } from 'vue';
import TabNavigation from '@/view/Admin/AccSettingsTab.vue'
import PersonalInformation from '@/components/PersonalInformation.vue';

import ChangePassword from '@/components/ChangePassword.vue';
import CustomerLayout from '@/Layout/CustomerLayout.vue';

const activeTab = ref('personal-info');

const tabs = [
  { id: 'personal-info', label: 'Personal Information' },
  { id: 'change-password', label: 'Change Password' }
];
</script>

<template>
  <CustomerLayout>
    <div class="min-h-screen p-4 md:p-8">
      
      <div class="max-w-4xl mx-auto mb-6">
        <h2 class="text-2xl md:text-3xl font-bold text-primary">Account Settings</h2>
      </div>

      <!-- Content Container -->
      <div class="flex justify-center">
        <div class="bg-white rounded-3xl border-2 p-4 md:p-6 w-full max-w-4xl">
          <div class="flex flex-col md:flex-row gap-4 md:gap-0">
            <!-- Left Sidebar - Tab Navigation -->
            <div class="w-full md:w-60 flex-shrink-0">
              <TabNavigation
                :tabs="tabs"
                :activeTab="activeTab"
                @update:activeTab="activeTab = $event"
              />
            </div>


            <div class="flex-1">
              <PersonalInformation v-if="activeTab === 'personal-info'" />
              <ChangePassword v-else-if="activeTab === 'change-password'" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </CustomerLayout>
</template>