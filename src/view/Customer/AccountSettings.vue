<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TabNavigation from '@/components/AccountSettingtTab.vue';
import PersonalInformation from '@/components/PersonalInformation.vue';
import MyAddresses from '@/components/MyAddresses.vue';
import ChangePassword from '@/components/ChangePassword.vue';
import CustomerLayout from '@/Layout/CustomerLayout.vue';

const route = useRoute();
const router = useRouter();
const activeTab = ref('personal-info');

const tabs = [
  { id: 'personal-info', label: 'Personal Information' },
  { id: 'my-addresses', label: 'My Addresses' },
  { id: 'change-password', label: 'Change Password' }
];

// Set active tab from URL query parameter
const setActiveTabFromQuery = () => {
  const tabFromQuery = route.query.tab as string;
  if (tabFromQuery && tabs.some(tab => tab.id === tabFromQuery)) {
    activeTab.value = tabFromQuery;
  } else {
    activeTab.value = 'personal-info';
  }
};

// Update URL when tab changes
const updateActiveTab = (tabId: string) => {
  activeTab.value = tabId;
  // Update URL without refreshing the page
  router.replace({ 
    query: { ...route.query, tab: tabId } 
  });
};

// Initialize tab from URL on component mount
onMounted(() => {
  setActiveTabFromQuery();
});

// Watch for route changes to update active tab
watch(() => route.query.tab, (newTab) => {
  if (newTab && tabs.some(tab => tab.id === newTab)) {
    activeTab.value = newTab as string;
  }
});
</script>

<template>
  <CustomerLayout>
    <h1 class="text-2xl sm:text-3xl font-bold mt-2 p-4 text-primary">Account Settings</h1>
    <div class="min-h-screen p-4 md:p-8">
      <!-- Content Container -->
      <div class="flex justify-center">
        <div class="bg-white rounded-3xl border-2 p-4 md:p-6 w-full max-w-5xl">
          <div class="flex flex-col md:flex-row gap-4 md:gap-0">
            <!-- Left Sidebar - Tab Navigation -->
            <div class="w-full md:w-60 flex-shrink-0">
              <TabNavigation
                :tabs="tabs"
                :activeTab="activeTab"
                @update:activeTab="updateActiveTab"
              />
            </div>

            <!-- Right Content Area -->
            <div class="flex-1">
              <PersonalInformation 
                v-if="activeTab === 'personal-info'"
                :key="'personal-info'"
              />
              <MyAddresses 
                v-else-if="activeTab === 'my-addresses'"
                :key="'my-addresses'"
              />
              <ChangePassword 
                v-else-if="activeTab === 'change-password'"
                :key="'change-password'"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </CustomerLayout>
</template>