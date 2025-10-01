import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import LandingPage from "@views/Landing/LandingPage.vue";
import Login from "@views/Auth/Login.vue";
import Register from "@/views/Auth/Register.vue";
import ForgotPassword from "@/views/Auth/ForgotPassword.vue";
import CustomerDashboard from "@views/Customer/Dashboard.vue";
import ContainerPage from "@/views/Customer/ContainerPage.vue";
import AddToCartPage from "@/views/Customer/AddToCartPage.vue";

const routes: Array<RouteRecordRaw> = [
  // Public routes
  { path: "/", name: "Landing", component: LandingPage },
  { path: "/login", name: "Login", component: Login },
  { path: "/register", name: "Register", component: Register },
  { path: "/forgotpass", name: "ForgotPass", component: ForgotPassword },

  // Protected routes - add meta: { requiresAuth: true }
  {
    path: "/customerDashboard",
    name: "CustomerDashboard",
    component: CustomerDashboard,
    meta: { requiresAuth: true }, // Add this line
  },
  {
    path: "/customerContainer",
    name: "CustomerContainer",
    component: ContainerPage,
    meta: { requiresAuth: true }, // Add this line
  },
  {
    path: "/customerCart",
    name: "CustomerCart",
    component: AddToCartPage,
    meta: { requiresAuth: true }, // Add this line
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: "smooth",
      };
    }
    return { top: 0 };
  },
});

// Add this navigation guard
router.beforeEach((to, from, next) => {
  // Check if the route requires authentication
  if (to.meta.requiresAuth) {
    // Check if user has token
    const token = localStorage.getItem("token");

    if (!token) {
      // Redirect to login if not authenticated
      next({
        name: "Login",
        query: { redirect: to.fullPath }, // Save where they wanted to go
      });
    } else {
      // User is authenticated, allow access
      next();
    }
  } else {
    // Route doesn't require auth, allow access
    next();
  }
});

export default router;
