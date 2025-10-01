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
        behavior: "smooth", // Optional: adds smooth scrolling
      };
    }
    return { top: 0 };
  },
});

router.beforeEach((to, from, next) => {
  // Check if the target route requires authentication
  if (to.meta.requiresAuth) {
    // Implement your authentication check logic here
    const isAuthenticated = localStorage.getItem("authToken"); // Example check

    if (isAuthenticated) {
      // User is authenticated, allow navigation
      next();
    } else {
      // User is not authenticated, redirect to login
      next({ name: "Login" });
    }
  } else {
    // Route doesn't require auth, allow navigation
    next();
  }
});

export default router;
