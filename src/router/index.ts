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
import AccountSettings from "@/view/Customer/AccountSettings.vue";
import Customer from "@views/Admin/Customer.vue";
import Rider from "@views/Admin/Rider.vue";

const routes: Array<RouteRecordRaw> = [
  { path: "/", name: "Landing", component: LandingPage },
  { path: "/login", name: "Login", component: Login },
  { path: "/register", name: "Register", component: Register },
  { path: "/forgotpass", name: "ForgotPass", component: ForgotPassword },
  
// Admin Routes 
  { path: "/customers", 
    name: "Customer", 
    component: Customer,
    meta: { requiresAuth: true, role: "admin" },
  },

  { path: "/riders", 
    name: "Rider", 
    component: Rider,
    meta: { requiresAuth: true, role: "admin" },
  },
  
// Customer Routes
  {
    path: "/customerDashboard",
    name: "CustomerDashboard",
    component: CustomerDashboard,
    meta: { requiresAuth: true, role: "customer" },
  },
  {
    path: "/customerContainer",
    name: "CustomerContainer",
    component: ContainerPage,
    meta: { requiresAuth: true, role: "customer" },
  },
  {
    path: "/customerCart",
    name: "CustomerCart",
    component: AddToCartPage,
    meta: { requiresAuth: true, role: "customer" },
  },
  {
    path: "/orderHistory",
    name: "OrderHistory",
    component: OrderHistory,
    meta: { requiresAuth: true, role: "customer" },
  },
    {
    path: "/accountSettings",
    name: "AccountSettings",
    component: AccountSettings,
    meta: { requiresAuth: true, role: "customer" },
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
  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;

  // ✅ 1. Public routes (no login needed)
  const publicPages = ["/", "/login", "/register", "/forgotpass"];
  const authRequired = to.matched.some((record) => record.meta.requiresAuth);

  // ✅ 2. If trying to access public routes and not logged in → allow
  if (publicPages.includes(to.path) && !token) {
    return next();
  }

  // ✅ 3. If trying to access protected route without token → go login
  if (authRequired && !token) {
    return next("/login");
  }

  // ✅ 4. If token exists, validate it
  if (token) {
    try {
      const isValid = await validateToken();
      if (!isValid) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return next("/login");
      }
    } catch (err) {
      console.error("Token validation failed:", err);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return next("/login");
    }
  }

  // ✅ 5. Role-based access control
  if (authRequired && to.meta.role && user?.role !== to.meta.role) {
    if (user?.role === "admin") return next("/customer");
    if (user?.role === "customer") return next("/customerDashboard");
    return next("/login");
  }

  // ✅ 6. Prevent logged-in users from visiting login/register again
  if (["/login", "/register", "/forgotpass"].includes(to.path) && token) {
    if (user?.role === "admin") return next("/customer");
    if (user?.role === "customer") return next("/customerDashboard");
    return next("/");
  }

  // ✅ 7. All clear
  next();
});


export default router;