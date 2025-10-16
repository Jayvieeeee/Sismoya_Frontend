import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import "./style.css";
import "animate.css";
import { validateToken } from "@/api/validateToken"; // ✅ import validator

const app = createApp(App);

app.use(createPinia());
app.use(router);

// ✅ Validate token on first load (even before navigating)
(async () => {
  const token = localStorage.getItem("token");

  if (token) {
    const isValid = await validateToken();

    if (!isValid) {
      console.log("🧹 Token expired or invalid — clearing and redirecting to login.");
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Prevent navigation before app mounts
      router.replace("/login");
    }
  }

  // Mount after token check
  app.mount("#app");
})();
