<script setup lang="ts">
interface Tab {
  id: string;
  label: string;
}

defineProps<{
  tabs: Tab[];
  activeTab: string;
}>();

const emit = defineEmits<{
  'update:activeTab': [value: string];
}>();
</script>

<template>
   <div class="h-[70vh] flex flex-col space-y-2 pr-8 border-r border-gray-200">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      @click="emit('update:activeTab', tab.id)"
      :class="[
        'px-6 py-2.5 mt-2 rounded-full text-left transition-all text-sm',
        activeTab === tab.id
          ? 'bg-primary/50 text-black font-medium'
          : 'bg-transparent hover:bg-secondary/50'
      ]"
    >
      {{ tab.label }}
    </button>
  </div>
</template>