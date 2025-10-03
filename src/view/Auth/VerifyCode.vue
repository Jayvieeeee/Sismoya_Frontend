<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import { verifyResetCode } from "@/api/forgotPassApi";

const props = defineProps<{ email: string }>();
const emit = defineEmits(["close", "verified"]);

const codes = ref(["", "", "", "", "", ""]); // 6-digit code
const error = ref("");
const inputRefs = ref<(HTMLInputElement | null)[]>([]);

// Focus first input on mount
nextTick(() => {
  if (inputRefs.value[0]) {
    inputRefs.value[0].focus();
  }
});

// Handle input changes
function handleInput(index: number, event: Event) {
  const target = event.target as HTMLInputElement;
  const value = target.value;
  
  // Only allow numbers
  if (!/^\d*$/.test(value)) {
    target.value = codes.value[index] = "";
    return;
  }
  
  codes.value[index] = value;
  
  // Auto-focus next input if current input has value
  if (value && index < 5) {
    nextTick(() => {
      if (inputRefs.value[index + 1]) {
        inputRefs.value[index + 1]?.focus();
      }
    });
  }
  
  // Clear error when user types
  if (error.value) {
    error.value = "";
  }
}

// Handle backspace key
function handleKeydown(index: number, event: KeyboardEvent) {
  if (event.key === 'Backspace' && !codes.value[index] && index > 0) {
    // Move to previous input on backspace if current is empty
    nextTick(() => {
      if (inputRefs.value[index - 1]) {
        inputRefs.value[index - 1]?.focus();
      }
    });
  }
}

// Handle paste event
function handlePaste(event: ClipboardEvent) {
  event.preventDefault();
  const pasteData = event.clipboardData?.getData('text') || '';
  const numbers = pasteData.replace(/\D/g, ''); // Remove non-digits
  
  if (numbers.length === 6) {
    // Fill all inputs with pasted numbers
    numbers.split('').forEach((num, index) => {
      if (index < 6) {
        codes.value[index] = num;
      }
    });
    
    // Focus last input
    nextTick(() => {
      if (inputRefs.value[5]) {
        inputRefs.value[5]?.focus();
      }
    });
  }
}

// Get the full code as string
const fullCode = () => codes.value.join('');

async function handleVerify() {
  const verificationCode = fullCode();
  
  if (verificationCode.length !== 6) {
    error.value = "Please enter the complete 6-digit code";
    return;
  }

  try {
    const res = await verifyResetCode(props.email, verificationCode);
    console.log("Code verified:", res);
    emit("verified", verificationCode);
  } catch (err: any) {
    error.value = err.response?.data?.message || "Invalid code. Try again.";
    
    // Clear all inputs on error and focus first input
    codes.value = ["", "", "", "", "", ""];
    nextTick(() => {
      if (inputRefs.value[0]) {
        inputRefs.value[0].focus();
      }
    });
  }
}
</script>

<template>
  <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div class="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
      <h2 class="text-xl font-semibold text-center mb-6">Verify Code</h2>
      <p class="text-sm text-gray-500 text-center mb-6">
        Enter the 6-digit code sent to your email <b>{{ props.email }}</b>
      </p>

      <div class="flex justify-center gap-2 mb-6">
        <input
          v-for="(digit, index) in codes"
          :key="index"
          :ref="el => inputRefs[index] = el as HTMLInputElement"
          v-model="codes[index]"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          maxlength="1"
          class="w-12 h-12 text-center text-lg font-semibold border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none transition-colors"
          @input="handleInput(index, $event)"
          @keydown="handleKeydown(index, $event)"
          @paste="handlePaste"
        />
      </div>

      <p v-if="error" class="text-red-500 text-sm text-center mb-4">{{ error }}</p>

      <div class="flex justify-between">
        <button 
          @click="$emit('close')" 
          class="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button 
          @click="handleVerify" 
          class="px-6 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
        >
          Verify
        </button>
      </div>
    </div>
  </div>
</template>