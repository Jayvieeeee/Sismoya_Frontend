<script setup>
import { useRouter } from 'vue-router';

import LandingPageLayout from '@/Layout/LandingPageLayout.vue'

const router = useRouter();

function goToLogin(){
  router.push('/login');
}
</script>


<template>
<LandingPageLayout>
  
<!--HOME-PAGE-->
  <section id="home" class="pt-20 relative font-montserrat h-screen bg-gradient-to-b from-white to-secondary">
  <div class="pt-20 flex flex-col items-center h-full text-center relative z-10">
    <h1 class="text-4xl text-primary font-medium leading-snug">
      Clean, cold, and refreshing water delivered <br>
      to you
    </h1>
    <p class="mt-4 text-lg my-5">
      Safe and refreshing drinking water for your family and community.
    </p>
    <button @click="goToLogin" class="bg-button text-xs px-6 py-3 rounded-3xl hover:bg-[#d54f14] hover:text-white mt-5">
      Order Now
    </button>
  </div>
   <img src="/images/LANDING_Image.png" 
     alt="Water Image"  
     class="absolute bottom-0 left-0 w-screen h-auto max-h-[500px]" />
    </section>

  <!--ABOUT-US-PAGE-->
  <section id="about" class="relative font-montserrat h-screen bg-gradient-to-b from-white to-secondary">
      <div class="pt-20 flex flex-col items-center h-full text-center relative z-10">
        <h1 class="text-5xl text-primary font-semibold">About Us</h1>
        <p class="pt-10 text-xl">
          At Sismoya Water, we are dedicated to providing clean, safe, and refreshing<br>
          drinking water for every home and business in our community. We believe that<br>
          access to quality water is essential for a healthy lifestyle, and we make it our<br>
          mission to deliver it with care.
        </p>
        <p class="pt-10 text-xl">
          With our modern purification process and commitment to safety, every drop from<br>
          Sismoya Water is guaranteed fresh and reliable. Wheter for daily hydration, family<br>
          use, or business needs, we make sure you always have water you can trust.
        </p>
        <img src="/images/container.png" alt="Container" class="pt-2 h-[400px] w-auto mx-auto"/>
      </div>
  </section>

<!-- SERVICES-PAGE -->
<section id="services" class="relative font-montserrat h-screen bg-gradient-to-b from-white to-secondary py-16">
  <div class="container mx-auto px-6 lg:px-20 text-center">
    <h2 class="text-5xl text-primary font-semibold py-10">Services</h2>
    <p class="max-w-4xl mx-auto mb-12 leading-[30px]">
      Sismoya Water offers safe and refreshing drinking water with convenient refilling, delivery, pick-up,<br>
       and container cleaning services for our community.
    </p>

    <!-- Service Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

      <div class="bg-white rounded-3xl shadow-md p-8 hover:shadow-xl transition duration-300">
        <h3 class="text-primary font-semibold text-lg mb-2">Pick-Up</h3>
        <img src="/icons/pickup.png" alt="Pick Up" class="h-[100px] mx-auto mb-4">
        <p class="text-sm font-medium">
          We pick-up empty container from the customers, refill them at the station, and return them once ready.
        </p>
      </div>

       <div class="bg-white rounded-3xl shadow-md p-8 hover:shadow-xl transition duration-300">
        <h3 class="text-primary font-semibold text-lg mb-2">Container Cleaning</h3>
        <img src="/icons/sanitize.png" alt="Pick Up" class="h-[100px] mx-auto mb-4">
        <p class="text-sm font-medium">
          We offer,  free or add-on cleaning, and sanitizing of customer containers before refilling.
        </p>
      </div>

      <div class="bg-white rounded-3xl shadow-md p-8 hover:shadow-xl transition duration-300">
        <h3 class="text-primary font-semibold text-lg mb-2">Water Refilling</h3>
        <img src="/icons/refill.png" alt="Pick Up" class="h-[100px] mx-auto mb-4">
        <p class="text-sm font-medium">
          We provide safe and clean drinking water refills for customers who bring their own containers.
        </p>
      </div>

     <div class="bg-white rounded-3xl shadow-md p-8 hover:shadow-xl transition duration-300">
        <h3 class="text-primary font-semibold text-lg mb-2">Home Delivery</h3>
        <img src="/icons/deliver.png" alt="Pick Up" class="h-[100px] mx-auto mb-4">
        <p class="text-sm font-medium">
          We deliver refilled containers containers directly to customer's homes or business for convenience.
        </p>
      </div>

    </div>
  </div>
</section>

<!-- DOWNLOAD-APP-PAGE -->
<section id="download-app" class="relative font-montserrat min-h-screen bg-gradient-to-b from-white to-secondary py-16">
  <div class="container mx-auto py-10 px-6 lg:px-20">
    <div class="grid grid-cols-1 md:grid-cols-2 items-center gap-10">
      
      <div>
        <h2 class="text-4xl md:text-5xl font-semibold text-primary mb-20">Download App</h2>

        <p class="text-lg leading-[40px] mb-6">
          Download the Sismoya Water App today and experience<br>
          hassle-free hydration—order refills, schedule deliveries or<br>
          pick-ups, and track your water anytime, anyway. Stay<br>
          refreshed with safe and clean drinking water right at your fingertips.
        </p>
        <a href="#" class="inline-block bg-button text-white font-semibold px-6 py-4 rounded-full shadow-md hover:bg-[#d54f14] hover:text-white mt-5">
          Download
        </a>
      </div>

      <div class="flex justify-center md:justify-center gap-6 ">
        <img src="/images/phone.png" alt="Phone" class="h-[320px] md:h-[500px] ml-48 mt-12">
      </div>
    </div>
  </div>
</section>


<!--CONTACT-US-PAGE-->
<section id="contact" class="relative font-montserrat min-h-screen bg-gradient-to-b from-white to-secondary py-16">

  <div class="container mx-auto px-6 lg:px-20 text-center">
    <h2 class="text-5xl font-semibold text-primary text-center pt-10 pb-12">Contact Us</h2>
    <p class="text-md text-center pb-20">Need help? Were here for you. Choose the best way to reach us:</p>

    <!-- Service Cards -->
    <div class="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-12">

      <div class="bg-white rounded-3xl shadow-md p-10 hover:shadow-xl transition duration-300">
        <img src="/icons/location.png" alt="Pick Up" class="h-[100px] mx-auto mb-4">
        <p class="text-sm font-semibold mb-2">Katarungan St. Bagong Barrio Caloocan City</p>
        <p class="text-base/7">
          Drop by our water station to place orders, ask questions, or get assistance directly from our friendly staff.
        </p>
      </div>

      <div class="bg-white rounded-3xl shadow-md p-10 hover:shadow-xl transition duration-300">
        <img src="/icons/phone.png" alt="Pick Up" class="h-[100px] mx-auto mb-4">
        <p class="text-sm font-semibold mb-2">09123456789</p>
        <p class="text-base/7">
          Reach us by phone for quick orders, delivery arrangements, or any immidiate concerns you may have.
        </p>
      </div>

      <div class="bg-white rounded-3xl shadow-md p-10 hover:shadow-xl transition duration-300">
        <img src="/icons/mail.png" alt="Pick Up" class="h-[100px] mx-auto mb-4">
         <p class="text-sm font-semibold mb-2">info@sismoya.com</p>
        <p class="text-base/7">
          Send us an email anytime for detailed inquiries, feedback, or service support, and we'll get back to you as soon as possible.
        </p>
      </div>
       
    </div>
  </div>
</section>

</LandingPageLayout>
</template>

