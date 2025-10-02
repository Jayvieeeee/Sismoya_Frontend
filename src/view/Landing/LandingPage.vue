<script setup>
import { useRouter } from 'vue-router'
import LandingPageLayout from '@/Layout/LandingPageLayout.vue'

const router = useRouter()

function goToLogin() {
  router.push('/login')
}
</script>

<template>
  <LandingPageLayout>
    <!-- HOME PAGE -->
    <section
      id="home"
      class=" pb-24 relative font-montserrat h-screen bg-gradient-to-b from-white to-secondary"
    >
      <div class="pt-20 flex flex-col items-center justify-center h-full text-center relative z-10 px-6">
        <h1 class="text-3xl md:text-4xl lg:text-5xl text-primary font-medium leading-snug">
          Clean, cold, and refreshing water delivered <br />
          to you
        </h1>
        <p class="mt-4 text-base md:text-lg my-5 max-w-2xl">
          Safe and refreshing drinking water for your family and community.
        </p>
        <button
          @click="goToLogin"
          class="bg-button text-xs md:text-sm px-6 py-3 rounded-3xl hover:bg-[#d54f14] hover:text-white mt-5"
        >
          Order Now
        </button>
      </div>
      <img
        src="/images/LANDING_Image.png"
        alt="Water Image"
        class="absolute bottom-0 left-0 w-full h-auto max-h-[400px] md:max-h-[500px] object-cover"
      />
    </section>

    <!-- ABOUT US -->
    <section
      id="about"
      class="relative font-montserrat min-h-screen bg-gradient-to-b from-white to-secondary flex flex-col justify-center px-6 mt-12"
    >
      <div class="text-center max-w-4xl mx-auto">
        <h1 class="text-4xl md:text-5xl text-primary font-semibold">About Us</h1>
        <p class="pt-8 md:pt-10 text-base md:text-xl leading-relaxed">
          At Sismoya Water, we are dedicated to providing clean, safe, and
          refreshing drinking water for every home and business in our
          community. We believe that access to quality water is essential for a
          healthy lifestyle, and we make it our mission to deliver it with care.
        </p>
        <p class="pt-6 md:pt-10 text-base md:text-xl leading-relaxed">
          With our modern purification process and commitment to safety, every
          drop from Sismoya Water is guaranteed fresh and reliable. Whether for
          daily hydration, family use, or business needs, we make sure you
          always have water you can trust.
        </p>
        <img
          src="/images/container.png"
          alt="Container"
          class="pt-8 md:pt-12 h-[250px] md:h-[400px] w-auto mx-auto"
        />
      </div>
    </section>

    <!-- SERVICES -->
    <section
      id="services"
      class="relative font-montserrat min-h-screen bg-gradient-to-b from-white to-secondary py-16 px-6"
    >
      <div class="container mx-auto text-center">
        <h2 class="text-4xl md:text-5xl text-primary font-semibold py-10">
          Services
        </h2>
        <p
          class="max-w-4xl mx-auto mb-12 text-sm md:text-base leading-relaxed"
        >
          Sismoya Water offers safe and refreshing drinking water with
          convenient refilling, delivery, pick-up, and container cleaning
          services for our community.
        </p>

        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          <!-- Pick-Up -->
          <div
            class="bg-white rounded-3xl shadow-md p-8 hover:shadow-xl transition duration-300"
          >
            <h3 class="text-primary font-semibold text-lg mb-2">Pick-Up</h3>
            <img
              src="/icons/pickup.png"
              alt="Pick Up"
              class="h-[80px] md:h-[100px] mx-auto mb-4"
            />
            <p class="text-sm font-medium">
              We pick up empty containers, refill them at the station, and
              return them once ready.
            </p>
          </div>

          <!-- Container Cleaning -->
          <div
            class="bg-white rounded-3xl shadow-md p-8 hover:shadow-xl transition duration-300"
          >
            <h3 class="text-primary font-semibold text-lg mb-2">
              Container Cleaning
            </h3>
            <img
              src="/icons/sanitize.png"
              alt="Container Cleaning"
              class="h-[80px] md:h-[100px] mx-auto mb-4"
            />
            <p class="text-sm font-medium">
              We offer free or add-on cleaning and sanitizing of containers
              before refilling.
            </p>
          </div>

          <!-- Water Refilling -->
          <div
            class="bg-white rounded-3xl shadow-md p-8 hover:shadow-xl transition duration-300"
          >
            <h3 class="text-primary font-semibold text-lg mb-2">
              Water Refilling
            </h3>
            <img
              src="/icons/refill.png"
              alt="Refill"
              class="h-[80px] md:h-[100px] mx-auto mb-4"
            />
            <p class="text-sm font-medium">
              We provide safe and clean drinking water refills for customer
              containers.
            </p>
          </div>

          <!-- Home Delivery -->
          <div
            class="bg-white rounded-3xl shadow-md p-8 hover:shadow-xl transition duration-300"
          >
            <h3 class="text-primary font-semibold text-lg mb-2">
              Home Delivery
            </h3>
            <img
              src="/icons/deliver.png"
              alt="Delivery"
              class="h-[80px] md:h-[100px] mx-auto mb-4"
            />
            <p class="text-sm font-medium">
              We deliver refilled containers directly to homes or businesses for
              convenience.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- DOWNLOAD APP -->
    <section
      id="download-app"
      class="relative font-montserrat min-h-screen bg-gradient-to-b from-white to-secondary py-16"
    >
      <div class="container mx-auto px-6 lg:px-20">
        <div class="grid grid-cols-1 md:grid-cols-2 items-center gap-10">
          <div>
            <h2
              class="text-3xl md:text-4xl lg:text-5xl font-semibold text-primary mb-10"
            >
              Download App
            </h2>
            <p class="text-base md:text-lg leading-relaxed mb-6">
              Download the Sismoya Water App today and experience hassle-free
              hydration—order refills, schedule deliveries or pick-ups, and
              track your water anytime, anywhere.
            </p>
            <a
              href="#"
              class="inline-block bg-button text-white font-semibold px-6 py-4 rounded-full shadow-md hover:bg-[#d54f14] transition"
            >
              Download
            </a>
          </div>
          <div
            class="flex justify-center md:justify-end"
          >
            <img
              src="/images/phone.png"
              alt="Phone"
              class="h-[280px] md:h-[400px] lg:h-[500px]"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- CONTACT US -->
    <section
      id="contact"
      class="relative font-montserrat min-h-screen bg-gradient-to-b from-white to-secondary py-16 px-6"
    >
      <div class="container mx-auto text-center">
        <h2
          class="text-4xl md:text-5xl font-semibold text-primary pt-10 pb-8"
        >
          Contact Us
        </h2>
        <p class="text-sm md:text-base text-gray-700 mb-12">
          Need help? We’re here for you. Choose the best way to reach us:
        </p>

        <div
          class="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <!-- Location -->
          <div
            class="bg-white rounded-3xl shadow-md p-10 hover:shadow-xl transition duration-300"
          >
            <img
              src="/icons/location.png"
              alt="Location"
              class="h-[80px] md:h-[100px] mx-auto mb-4"
            />
            <p class="text-sm font-semibold mb-2">
              34 Katarungan St. Barangay 149 Bagong Barrio Caloocan City
            </p>
            <p class="text-sm md:text-base leading-relaxed">
              Drop by our water station to place orders, ask questions, or get
              assistance directly from our staff.
            </p>
          </div>

          <!-- Phone -->
          <div
            class="bg-white rounded-3xl shadow-md p-10 hover:shadow-xl transition duration-300"
          >
            <img
              src="/icons/phone.png"
              alt="Phone"
              class="h-[80px] md:h-[100px] mx-auto mb-4"
            />
            <p class="text-sm font-semibold mb-2">09123456789</p>
            <p class="text-sm md:text-base leading-relaxed">
              Reach us by phone for quick orders, delivery arrangements, or any
              immediate concerns.
            </p>
          </div>

          <!-- Email -->
          <div
            class="bg-white rounded-3xl shadow-md p-10 hover:shadow-xl transition duration-300"
          >
            <img
              src="/icons/mail.png"
              alt="Email"
              class="h-[80px] md:h-[100px] mx-auto mb-4"
            />
            <p class="text-sm font-semibold mb-2">sismoya@gmail.com</p>
            <p class="text-sm md:text-base leading-relaxed">
              Send us an email for detailed inquiries, feedback, or support, and
              we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </div>
    </section>
  </LandingPageLayout>
</template>
