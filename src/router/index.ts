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

async function checkAuth() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const res = await fetch("https://sismoya.com/api", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (res.ok && data.success) {
      localStorage.setItem("user", JSON.stringify(data.user));
      return data.user;
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return null;
    }
  } catch (err) {
    console.error("Auth check failed:", err);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return null;
  }
}

router.beforeEach(async (to, from, next) => {
  const user = await checkAuth();

  if (to.meta.requiresAuth && !user) {
    return next("/login");
  }

  if (
    (to.path === "/login" ||
      to.path === "/register" ||
      to.path === "/forgotpass") &&
    user
  ) {
    return next("/customerDashboard");
  }

  next();
});

export default router;
