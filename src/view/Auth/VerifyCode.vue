<script setup lang="ts">
import { ref } from "vue";
import { verifyResetCode } from "@/api/forgotPassApi";

const props = defineProps<{ email: string }>();
const emit = defineEmits(["close", "verified"]);

const code = ref("");
const error = ref("");

async function handleVerify() {
  try {
    const res = await verifyResetCode(props.email, code.value);
    console.log("Code verified:", res);
    emit("verified", code.value); // ✅ pass code to parent
  } catch (err: any) {
    error.value = err.response?.data?.message || "Invalid code. Try again.";
  }
}
</script>

<template>
  <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div class="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
      <h2 class="text-xl font-semibold text-center mb-6">Verify Code</h2>
      <p class="text-sm text-gray-500 text-center mb-4">
        Enter the code sent to your email <b>{{ props.email }}</b>
      </p>

      <input
        v-model="code"
        type="text"
        placeholder="Enter Code"
        class="w-full px-4 py-2 border rounded-lg mb-4"
      />
      <p v-if="error" class="text-red-500 text-sm text-center mb-3">{{ error }}</p>

      <div class="flex justify-between">
        <button @click="$emit('close')" class="px-4 py-2 rounded-lg border hover:bg-gray-100">← Back</button>
        <button @click="handleVerify" class="px-4 py-2 rounded-lg bg-primary text-white">Verify</button>
      </div>
    </div>
  </div>
</template>
