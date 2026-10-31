<script setup>
import { useRouter } from 'vue-router'
import LandingPageLayout from '@/Layout/LandingPageLayout.vue'
import gallon from "@/assets/images/new_gallon_img.png"
import droplet from "@/assets/icons/droplet.png"
import securityIcon from "@/assets/icons/security.png"
import fastDeliveryIcon from "@/assets/icons/truck.png"
import ecoFriendlyIcon from "@/assets/icons/leaf.png"
import phoneMockup from "@/assets/icons/phone_mockup.png"
import waterStation from "@/assets/images/water_station.png"

const router = useRouter()

function goToLogin() {
  router.push('/login')
}
</script>

<template>
  <LandingPageLayout>
    <!-- HOME PAGE -->
<section id="home" class="relative font-montserrat min-h-screen bg-white pt-16">
  <div class="max-w-7xl mx-auto px-6 md:px-12 h-full flex flex-col md:flex-row items-center justify-between gap-12 py-16 md:py-24">
    
    <div class="flex-1 text-left max-w-xl">
     
      <span class="inline-flex items-center gap-2 bg-blue-50 text-blue-600 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
        <img :src="droplet" alt="Droplet Icon" class="w-5 h-5" />
        Pure · Safe · Refreshing
      </span>

      <h1 class="text-4xl md:text-5xl text-gray-900 font-bold leading-tight">
        Clean and refreshing water delivered to you
      </h1>

      <p class="mt-5 text-sm md:text-base text-gray-500 max-w-md">
        Safe and refreshing drinking water for your family and community. Trusted by hundreds of households every day.
      </p>

      <div class="flex items-center gap-6 mt-8">
        <button
          @click="goToLogin"
          class="bg-blue-600 text-white text-sm font-medium px-6 py-3 rounded-full hover:bg-blue-700 transition"
        >
          Order Now
        </button>
        <button class="text-sm text-gray-700 font-medium flex items-center gap-1 hover:text-gray-900 transition">
          Learn more <span>→</span>
        </button>
      </div>

      <!-- Stats -->
      <div class="flex items-center gap-8 mt-12 pt-8 border-t border-gray-200">
        <div>
          <p class="text-xl font-bold text-gray-900">500+</p>
          <p class="text-xs text-gray-400 mt-1">Happy customers</p>
        </div>
        <div class="w-px h-8 bg-gray-200"></div>
        <div>
          <p class="text-xl font-bold text-gray-900">100%</p>
          <p class="text-xs text-gray-400 mt-1">Purified water</p>
        </div>
        <div class="w-px h-8 bg-gray-200"></div>
        <div>
          <p class="text-xl font-bold text-gray-900">24/7</p>
          <p class="text-xs text-gray-400 mt-1">Delivery available</p>
        </div>

      </div>
    </div>
    
         <div>
          <img :src="gallon" alt="Sismoya Water containers" class="min-h-md h-auto object-cover" />
        </div>
  </div>
</section>

<!-- ABOUT US -->
<section id="about" class="relative font-montserrat min-h-screen bg-#F5F5F5 flex items-center px-6 mt-14">
  <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
    
    <!-- Left: Image -->
    <div class="w-full">
      <img :src="waterStation" alt="Sismoya Water containers" class="w-full h-auto object-cover" />
    </div>

    <!-- Right: Content -->
    <div class="text-left">
      <span class="text-sm md:text-base font-semibold tracking-wide text-primary uppercase">
        About Us
      </span>

      <h1 class="pt-3 text-3xl md:text-4xl font-bold leading-tight text-gray-900">
        Dedicated to quality water for everyone
      </h1>

      <p class="pt-5 text-base md:text-lg leading-relaxed text-gray-600">
        At Sismoya Water, we are dedicated to providing clean, safe, and
        refreshing drinking water for every home and business in our
        community. We believe that access to quality water is essential for a
        healthy lifestyle.
      </p>

      <p class="pt-4 text-base md:text-lg leading-relaxed text-gray-600">
        With our modern purification process and commitment to safety, every
        drop from Sismoya Water is guaranteed fresh and reliable — whether
        for daily hydration, family use, or business needs.
      </p>

      <!-- Feature icons -->
      <div class="pt-8 flex flex-wrap gap-6 md:gap-8">
        <div class="flex items-center gap-2">
          <img :src="securityIcon" alt="Certified Purification icon" class="w-5 h-5 md:w-6 md:h-6 object-contain"/>
          <span class="text-sm md:text-base font-medium text-gray-800">
            Certified Purification
          </span>
        </div>

        <div class="flex items-center gap-2">
          <img :src="fastDeliveryIcon" alt="Fast Delivery icon" class="w-5 h-5 md:w-6 md:h-6 object-contain"/>
          <span class="text-sm md:text-base font-medium text-gray-800">
            Fast Delivery
          </span>
        </div>

        <div class="flex items-center gap-2">
          <img :src="ecoFriendlyIcon" alt="Eco Friendly icon" class="w-5 h-5 md:w-6 md:h-6 object-contain"/>
          <span class="text-sm md:text-base font-medium text-gray-800">
            Eco Friendly
          </span>
        </div>
      </div>
    </div>

  </div>
</section>

    <!-- SERVICES -->
<section id="services" class="relative font-montserrat min-h-screen bg-white py-16 px-6">
  <div class="container mx-auto text-center">
    <h2 class="text-4xl md:text-5xl text-gray-900 font-bold mb-4">
      Our Services
    </h2>
    <p class="max-w-2xl mx-auto mb-12 text-sm md:text-base text-gray-500 leading-relaxed">
      Sismoya Water offers safe and refreshing drinking water with
      convenient refilling, delivery, pick-up, and container cleaning
      services.
    </p>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

      <!-- Pick-Up -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 hover:shadow-md transition duration-300">
        <div class="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-5">
          <!-- package icon -->
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.27 6.96L12 12l8.73-5.04M12 22.08V12" />
          </svg>
        </div>
        <h3 class="text-gray-900 font-semibold text-base mb-2">Pick-Up</h3>
        <p class="text-sm text-gray-500 leading-relaxed">
          We pick up empty containers from customers, refill them at the
          station, and return them once ready.
        </p>
      </div>

      <!-- Container Cleaning -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 hover:shadow-md transition duration-300">
        <div class="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-5">
          <!-- sparkles icon -->
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </div>
        <h3 class="text-gray-900 font-semibold text-base mb-2">Container Cleaning</h3>
        <p class="text-sm text-gray-500 leading-relaxed">
          We offer free or add-on cleaning and sanitizing of customer
          containers before refilling.
        </p>
      </div>

      <!-- Water Refilling -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 hover:shadow-md transition duration-300">
        <div class="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-5">
          <!-- refresh icon -->
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <h3 class="text-gray-900 font-semibold text-base mb-2">Water Refilling</h3>
        <p class="text-sm text-gray-500 leading-relaxed">
          We provide safe and clean drinking water refills for customers
          who bring their own containers.
        </p>
      </div>

      <!-- Home Delivery -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 hover:shadow-md transition duration-300">
        <div class="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-5">
          <!-- truck icon -->
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v9a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8h4l3 3v4a1 1 0 01-1 1h-1m-6 0a2 2 0 11-4 0m4 0a2 2 0 10-4 0m10 0a2 2 0 11-4 0m4 0a2 2 0 10-4 0" />
          </svg>
        </div>
        <h3 class="text-gray-900 font-semibold text-base mb-2">Home Delivery</h3>
        <p class="text-sm text-gray-500 leading-relaxed">
          We deliver refilled containers directly to your home or business
          for maximum convenience.
        </p>
      </div>

    </div>
  </div>
</section>

<!-- MOBILE APP -->
<section id="download" class="relative font-montserrat bg-[#F4F8FF] py-20 px-6">
  <div class="container mx-auto flex flex-col-reverse lg:flex-row items-center justify-between gap-12">

    <!-- Left: Text content -->
    <div class="flex-1 text-center lg:text-left">
      <p class="text-primary text-xs font-bold tracking-widest uppercase mb-3">
        Mobile App
      </p>
      <h2 class="text-3xl md:text-4xl text-gray-900 font-bold leading-tight mb-4">
        Download the Sismoya<br class="hidden lg:block" />
        Water app
      </h2>
      <p class="text-sm md:text-base text-gray-500 leading-relaxed max-w-md mx-auto lg:mx-0 mb-8">
        Download the Sismoya Water app today and experience hassle-free
        hydration — order refills, schedule deliveries, pick-ups, and track
        your water anytime, anywhere. Stay refreshed with safe and clean
        drinking water right at your fingertips.
      </p>
      
      <a href="#" class="inline-block bg-primary text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-primary/90 transition duration-300">
        Download App
      </a>
    </div>

    <!-- Right: Phone mockup image -->
    <div class="flex-1 flex justify-center lg:justify-end">
      <img
        :src="phoneMockup"
        alt="Sismoya Water App"
        class="w-full max-w-md lg:max-w-lg object-contain"
      />
    </div>

  </div>
</section>

<!-- CONTACT US -->
<section id="contact" class="relative font-montserrat bg-white py-16 px-6">
  <div class="container mx-auto text-center">
    <h2 class="text-3xl md:text-4xl text-gray-900 font-bold mb-4">
      Contact Us
    </h2>
    <p class="max-w-2xl mx-auto mb-12 text-sm md:text-base text-gray-500 leading-relaxed">
      Need help? We're here for you. Choose the best way to reach us:
    </p>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">

      <!-- Visit Us -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 hover:shadow-md transition duration-300">
        <div class="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-5">
          <!-- map pin icon -->
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 class="text-gray-900 font-semibold text-base mb-2">Visit Us</h3>
        
          <a href="https://maps.google.com/?q=34+Katarungan+St.+Brgy+149+Bagong+Barrio+Caloocan+City"
          target="_blank"
          class="block text-primary text-sm font-medium mb-2 hover:underline">
          34 Katarangan St. Brgy 149 Bagong Barrio Caloocan City
        </a>
        <p class="text-sm text-gray-500 leading-relaxed">
          Drop by our water station to place orders, ask questions, or get
          assistance directly from our friendly staff.
        </p>
      </div>

      <!-- Call Us -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 hover:shadow-md transition duration-300">
        <div class="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-5">
          <!-- phone icon -->
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </div>
        <h3 class="text-gray-900 font-semibold text-base mb-2">Call Us</h3>
        
          <a href="tel:09061235486"
          class="block text-primary text-sm font-medium mb-2 hover:underline">
          09061235486
        </a>
        <p class="text-sm text-gray-500 leading-relaxed">
          Reach us by phone for quick orders, delivery arrangements, or any
          immediate concerns you may have.
        </p>
      </div>

      <!-- Email Us -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 hover:shadow-md transition duration-300">
        <div class="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-5">
          <!-- mail icon -->
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 class="text-gray-900 font-semibold text-base mb-2">Email Us</h3>
        
          <a href="mailto:sismoyawater@gmail.com"
          class="block text-primary text-sm font-medium mb-2 hover:underline">
          sismoyawater@gmail.com
        </a>
        <p class="text-sm text-gray-500 leading-relaxed">
          Send us an email anytime for detailed inquiries, feedback, or
          service support, and we'll get back to you as soon as possible.
        </p>
      </div>

    </div>
  </div>
</section>
    
  </LandingPageLayout>
</template>
