<script setup lang="ts">
import { ref, computed, watch } from "vue"

// Props
const props = defineProps<{ isOpen: boolean }>()
const emit = defineEmits<{
  (e: "close"): void
  (e: "save", value: string): void
}>()

// State
const currentDate = ref(new Date())
const selectedDate = ref<Date | null>(null)
const selectedTime = ref("")  // default empty
const isTimeDropdownOpen = ref(false)

// Get current time in Philippine Time (UTC+8)
function getCurrentPhilippineTime() {
  const now = new Date();
  // Convert to Philippine Time (UTC+8)
  const phTime = new Date(now.getTime() + (8 * 60 * 60 * 1000) + (now.getTimezoneOffset() * 60 * 1000));
  return phTime;
}

// Month navigation
function prevMonth() {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  )
}
function nextMonth() {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  )
}

// Helpers
function getDaysInMonth(year: number, month: number) {
  const date = new Date(year, month, 1)
  const days: (Date | null)[] = []

  // pad start
  for (let i = 0; i < date.getDay(); i++) {
    days.push(null)
  }

  // actual days
  while (date.getMonth() === month) {
    days.push(new Date(date))
    date.setDate(date.getDate() + 1)
  }

  return days
}

function isNextMonth(day: Date) {
  return day.getMonth() > currentDate.value.getMonth() || 
         (day.getMonth() === 0 && currentDate.value.getMonth() === 11)
}

function isPrevMonth(day: Date) {
  return day.getMonth() < currentDate.value.getMonth() || 
         (day.getMonth() === 11 && currentDate.value.getMonth() === 0)
}

function isPastDate(day: Date) {
  const today = getCurrentPhilippineTime();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(day);
  compareDate.setHours(0, 0, 0, 0);
  return compareDate < today;
}

function handleSave() {
  if (!selectedDate.value) return;

  const d = selectedDate.value;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");

  emit("save", `${yyyy}-${mm}-${dd} ${selectedTime.value}`);
  emit("close");
}

function formatTime(hour: number) {
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  const period = hour < 12 ? 'AM' : 'PM'
  return `${String(displayHour).padStart(2, '0')}:00 ${period}`
}

// Check if a time slot is available
function isTimeSlotAvailable(hour: number) {
  if (!selectedDate.value) return false;
  
  const now = getCurrentPhilippineTime();
  const selectedDateTime = new Date(selectedDate.value);
  
  // Set time in Philippine Time
  selectedDateTime.setHours(hour, 0, 0, 0);
  
  // If the selected date is today, check if the time is in the past
  const isToday = selectedDate.value.toDateString() === now.toDateString();
  
  if (isToday) {
    return selectedDateTime > now;
  }
  
  // For future dates, all time slots are available
  return true;
}

function getAvailableTimeSlots() {
  const slots = [];
  for (let h = 8; h <= 17; h++) {
    if (isTimeSlotAvailable(h)) {
      slots.push(h);
    }
  }
  return slots;
}

// Reset selected time when date changes
watch(selectedDate, (newDate) => {
  if (newDate) {
    // Check if the current selected time is still available
    if (selectedTime.value) {
      const hour = parseInt(selectedTime.value.split(':')[0]);
      if (!isTimeSlotAvailable(hour)) {
        selectedTime.value = "";
      }
    }
  } else {
    selectedTime.value = "";
  }
});

// Formatting
const monthLabel = (d: Date) =>
  d.toLocaleString("default", { month: "long", year: "numeric" })

// Display current Philippine time
const currentPhilippineTime = computed(() => {
  return getCurrentPhilippineTime().toLocaleString('en-PH', {
    timeZone: 'Asia/Manila',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
});
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div class="bg-white rounded-3xl shadow-xl w-[600px] p-8 relative">
      
      <!-- Close -->
      <button @click="emit('close')" class="absolute top-6 right-6 text-gray-400 hover:text-gray-600 text-2xl font-light">✕</button>
      
      <!-- Title -->
      <h2 class="text-center text-xl font-medium text-primary mb-3">
        Date And Time Selection
      </h2>

      <!-- Main Content: Calendar and Time Side by Side -->
      <div class="flex gap-6 mb-8">
        <!-- Date Selector -->
        <div class="max-w-md w-full">
          <div class="border-2 border-black rounded-lg p-1 text-center mb-2">
            <span class="font-medium">Select a day</span>
          </div>
          
          <!-- Calendar -->
          <div class="border-2 border-black rounded-lg p-4">
            <!-- Month nav -->
            <div class="flex justify-between items-center mb-4">
              <span class="font-semibold text-lg">{{ monthLabel(currentDate) }}</span>
              <button @click="prevMonth" class="p-2 hover:bg-gray-100 rounded-lg text-xl">&#11164;</button>
              <button @click="nextMonth" class="p-2 hover:bg-gray-100 rounded-lg text-xl">&#11166;</button>
            </div>

            <!-- Weekdays -->
            <div class="grid grid-cols-7 text-center text-sm font-medium mb-2">
              <span class="py-2">Sun</span>
              <span class="py-2">Mon</span>
              <span class="py-2">Tue</span>
              <span class="py-2">Wed</span>
              <span class="py-2">Thu</span>
              <span class="py-2">Fri</span>
              <span class="py-2">Sat</span>
            </div>

            <!-- Days -->
            <div class="grid grid-cols-7 text-center gap-1">
              <template v-for="(day, index) in getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth())" :key="index">
               <div
                    v-if="day"
                    @click="!isPastDate(day) && (selectedDate = day)"
                    class="p-2 rounded-lg cursor-pointer text-sm transition-colors"
                    :class="{
                        'bg-sky-500 text-white': selectedDate?.toDateString() === day.toDateString(),
                        'hover:bg-gray-100': selectedDate?.toDateString() !== day.toDateString() && !isPastDate(day),
                        'text-gray-400 cursor-not-allowed': isPastDate(day) || isPrevMonth(day) || isNextMonth(day),
                        'text-gray-900': !isPrevMonth(day) && !isNextMonth(day) && !isPastDate(day)
                    }"
                    >
                    {{ day.getDate() }}
                </div>

                <div v-else class="p-2"></div>
              </template>
            </div>
          </div>
        </div>

        <!-- Time Selector -->
        <div class="w-[300px] mt-8">
          <div class="relative">
            <button
              @click="isTimeDropdownOpen = !isTimeDropdownOpen"
              :disabled="!selectedDate"
              class="w-full border-2 border-black rounded-lg px-4 py-2 text-left flex justify-between items-center hover:border-gray-400 transition-colors disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <span class="text-gray-700">
                {{ selectedTime ? formatTime(parseInt(selectedTime.split(':')[0])) : 'Select a time' }}
              </span>
              <span class="font-medium align-center" :class="{ 'rotate-180': isTimeDropdownOpen }">&#11165;</span>
            </button>
            
            <!-- Time Dropdown -->
            <div v-if="isTimeDropdownOpen && selectedDate" class="absolute top-full mt-2 w-full bg-white border-2 border-gray-300 rounded-2xl max-h-48 overflow-y-auto shadow-lg z-10">
              <div
                v-for="h in getAvailableTimeSlots()" 
                :key="h"
                @click="selectedTime = `${String(h).padStart(2,'0')}:00`; isTimeDropdownOpen = false"
                class="px-4 py-3 hover:bg-gray-50 cursor-pointer text-gray-700 border-b border-gray-100 last:border-b-0"
              >
                {{ formatTime(h) }}
              </div>
              <div v-if="getAvailableTimeSlots().length === 0" class="px-4 py-3 text-gray-500 text-center">
                No available times for today
              </div>
            </div>
          </div>
            <p class="text-xs mt-4 italic text-gray-500">Note: Each timeslot can accommodate up to 5 orders, and orders are processed based on route optimization (nearest to the store first).</p>
        </div>
      </div>

      <!-- Save Button -->
      <div class="flex justify-center">
        <button
          @click="handleSave"
          :disabled="!selectedDate || !selectedTime"
          class="bg-sky-500 text-white px-12 py-3 rounded-2xl hover:bg-sky-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
        >
          Save
        </button>
      </div>
    </div>
  </div>
</template>