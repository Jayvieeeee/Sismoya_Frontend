import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import "./style.css";
import { validateToken } from "@/api/validateToken";

const app = createApp(App);

app.use(createPinia());

(async () => {
  const token = localStorage.getItem("token");

  if (token) {
    const isValid = await validateToken();
    if (!isValid) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/login");
    }
  }

  app.use(router);
  app.mount("#app");
})();
