// In your main.ts file
import { createApp } from "vue";
import { createPinia, type PiniaPluginContext } from "pinia";
import App from "./App.vue";
import router from "./router";
import "./style.css";

// Define a simple persistence plugin
function PiniaPersistPlugin({ store }: PiniaPluginContext) {
  // Attempt to load stored state from localStorage when the store is created
  const storedState = localStorage.getItem(`pinia-${store.$id}`);
  if (storedState) {
    store.$patch(JSON.parse(storedState));
  }

  // Subscribe to store changes and save the state to localStorage
  store.$subscribe((_mutation, state) => {
    localStorage.setItem(`pinia-${store.$id}`, JSON.stringify(state));
  });
}

const app = createApp(App);
const pinia = createPinia();

// Use your custom plugin
pinia.use(PiniaPersistPlugin);

app.use(pinia);
app.use(router);
app.mount("#app");
