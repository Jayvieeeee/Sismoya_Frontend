// main.ts (minimal changes)
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import "./style.css";
import "animate.css";
import { validateToken } from "@/api/validateToken";


const handleLogout = async () => {
  const Swal = await import('sweetalert2');
  await Swal.default.fire({
    icon: 'info',
    title: 'Session Expired',
    text: 'Your session has expired. Please log in again.',
    confirmButtonText: 'OK',
    confirmButtonColor: '#3085d6'
  });
  
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  router.replace("/login");
};

const app = createApp(App);

app.use(createPinia());
app.use(router);

// Validate token on first load
(async () => {
  const token = localStorage.getItem("token");

  if (token) {
    const isValid = await validateToken();

    if (!isValid) {
      await handleLogout();
    }
  }

  // Mount after token check
  app.mount("#app");
})();