// router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { validateToken } from "@/api/validateToken";


import LandingPage from "@views/Landing/LandingPage.vue";
import Login from "@views/Auth/Login.vue";
import Register from "@views/Auth/Register.vue";
import ForgotPassword from "@views/Auth/ForgotPassword.vue";
import CustomerDashboard from "@views/Customer/Dashboard.vue";
import ContainerPage from "@views/Customer/ContainerPage.vue";
import AddToCartPage from "@views/Customer/AddToCartPage.vue";
import OrderHistory from "@/view/Customer/OrderHistory.vue";

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
  {
    path: "/orderHistory",
    name: "OrderHistory",
    component: OrderHistory,
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

// 🔐 Improved Guard with better error handling
router.beforeEach(async (to, from, next) => {
  try {
    if (to.meta.requiresAuth) {
      const isValid = await validateToken();
      if (!isValid) {
        console.log('🛑 Auth required but token invalid, redirecting to login');
        return next("/login");
      }
    }

    // 🚀 If already logged in and tries to access /login, redirect to dashboard
    if (to.path === "/login") {
      const isValid = await validateToken();
      if (isValid) {
        console.log('✅ User already logged in, redirecting to dashboard');
        return next("/customerDashboard");
      }
    }

    next();
  } catch (error) {
    console.error('🚨 Router guard error:', error);
    // In case of unexpected errors, proceed to the route
    // This prevents the app from getting stuck
    next();
  }
});

export default router;