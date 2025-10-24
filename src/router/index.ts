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
import PaymentSuccess from "@/components/PaymentSuccess.vue";
import PaymentCancel from "@/components/PaymentCancel.vue"; 
import Order from "@views/Admin/Orders.vue"
import AdminAccountSettings from "@/view/Admin/AccountSettings.vue"
import SiteSettings from "@/view/Admin/SiteSettings.vue";
import AdminDashboard from "@/view/Admin/AdminDashboard.vue";

  const routes: Array<RouteRecordRaw> = [
    { path: "/", name: "Landing", component: LandingPage },
    { path: "/login", name: "Login", component: Login },
    { path: "/register", name: "Register", component: Register },
    { path: "/forgotpass", name: "ForgotPass", component: ForgotPassword },

    //Payment Routes
  { path: "/payment-success", name: "PaymentSuccess", component: PaymentSuccess },
  { path: "/payment-cancel",  name: "PaymentCancel",  component: PaymentCancel },
    
  // Admin Routes 
    { path: "/adminDashboard", name: "adminDashboard", component: AdminDashboard, meta: { requiresAuth: true, role: "admin" },},
    { path: "/customers", name: "Customer", component: Customer, meta: { requiresAuth: true, role: "admin" },},
    { path: "/riders", name: "Rider", component: Rider, meta: { requiresAuth: true, role: "admin" },},
    { path: "/adminOrders", name: "Order", component: Order, meta: { requiresAuth: true, role: "admin" },},
    { path: "/adminAccountSettings", name: "AdminAccountSettings", component: AdminAccountSettings,meta: { requiresAuth: true, role: "admin" },},
    { path: "/siteSettings", name: "SiteSettings", component: SiteSettings, meta: { requiresAuth: true, role: "admin" },},
    
  // Customer Routes
    { path: "/customerDashboard", name: "CustomerDashboard", component: CustomerDashboard, meta: { requiresAuth: true, role: "customer" },},
    { path: "/customerContainer", name: "CustomerContainer", component: ContainerPage, meta: { requiresAuth: true, role: "customer" },},
    { path: "/customerCart", name: "CustomerCart", component: AddToCartPage, meta: { requiresAuth: true, role: "customer" },},
    { path: "/orderHistory", name: "OrderHistory", component: OrderHistory, meta: { requiresAuth: true, role: "customer" },},
    { path: "/accountSettings", name: "AccountSettings", component: AccountSettings, meta: { requiresAuth: true, role: "customer" },},
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

    // public routes
    const publicPages = ["/", "/login", "/register", "/forgotpass"];
    const authRequired = to.matched.some((record) => record.meta.requiresAuth);


    if (publicPages.includes(to.path) && !token) {
      return next();
    }

    if (authRequired && !token) {
      return next("/login");
    }

    // validate token if it exists
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

    // roled-based access control
    if (authRequired && to.meta.role && user?.role !== to.meta.role) {
      if (user?.role === "admin") return next("/customer");
      if (user?.role === "customer") return next("/customerDashboard");
      return next("/login");
    }

    if (["/login", "/register", "/forgotpass"].includes(to.path) && token) {
      if (user?.role === "admin") return next("/customer");
      if (user?.role === "customer") return next("/customerDashboard");
      return next("/");
    }

    next();
  });


  export default router;