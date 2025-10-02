// main.ts
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { validateToken } from "@/api/validateToken";

const app = createApp(App);

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
