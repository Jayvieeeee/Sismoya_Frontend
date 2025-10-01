import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import LandingPage from "@views/Landing/LandingPage.vue";
import Login from "@views/Auth/Login.vue";
import Register from "@/view/Auth/Register.vue";
import ForgotPassword from "@/view/Auth/ForgotPassword.vue";
import CustomerDashboard from "@views/Customer/Dashboard.vue";
import ContainerPage from "@/view/Customer/ContainerPage.vue";
import AddToCartPage from "@/view/Customer/AddToCartPage.vue";

const routes: Array<RouteRecordRaw> = [
  { path: "/", name: "Landing", component: LandingPage },
  { path: "/login", name: "Login", component: Login },
  { path: "/register", name: "Register", component: Register },
  { path: "/forgotpass", name: "ForgotPass", component: ForgotPassword },
  {
    path: "/customerDashboard",
    name: "CustomerDashboard",
    component: CustomerDashboard,
    meta: { requiresAuth: true },
  },
  {
    path: "/customerContainer",
    name: "CustomerContainer",
    component: ContainerPage,
    meta: { requiresAuth: true },
  },
  {
    path: "/customerCart",
    name: "CustomerCart",
    component: AddToCartPage,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) {
      return { el: to.hash, behavior: "smooth" };
    }
    return { top: 0 };
  },
});

router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem("token");

  if (token) {
    try {
      const res = await fetch("https://sismoya.com/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        localStorage.removeItem("token");
        if (to.meta.requiresAuth) {
          return next("/login");
        }
      }
    } catch (e) {
      console.error("Auth check failed", e);
      localStorage.removeItem("token");
      if (to.meta.requiresAuth) {
        return next("/login");
      }
    }
  }

  if (to.meta.requiresAuth && !token) {
    return next("/login");
  }

  if ((to.path === "/login" || to.path === "/register") && token) {
    return next("/customerDashboard");
  }

  next();
});

export default router;
