import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import LandingPage from '@views/Landing/LandingPage.vue'
import Login from '@views/Auth/Login.vue'
import Register from '@/view/Auth/Register.vue'
import ForgotPassword from '@/view/Auth/ForgotPassword.vue'
import CustomerDashboard from '@views/Customer/Dashboard.vue'
import ContainerPage from '@/view/Customer/ContainerPage.vue'
import AddToCartPage from '@/view/Customer/AddToCartPage.vue'

const routes: Array<RouteRecordRaw> = [
  { path: '/', name: 'Landing', component: LandingPage },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/forgotpass', name:'ForgotPass', component: ForgotPassword},
  { path: '/customerDashboard', name:'CustomerDashboard', component: CustomerDashboard},
  { path: '/customerContainer', name:'CustomerContainer', component: ContainerPage},
  { path: '/customerCart', name:'CustomerCart', component: AddToCartPage}
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth', // Optional: adds smooth scrolling
      }
    }
    return { top: 0 }
  },
})

export default router
