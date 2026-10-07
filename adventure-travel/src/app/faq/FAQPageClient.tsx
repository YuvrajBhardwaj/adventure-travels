"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FadeUp,
  StaggerContainer,
  StaggerItem,
} from "@/components/MotionWrapper";

// Inline SVG Icons
function SearchIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function ChevronDownIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

function MessageCircleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641l-.442 1.768a1.875 1.875 0 002.261 2.261l1.768-.442c.6-.154 1.194.154 1.641.586A9.49 9.49 0 0012 20.25z" />
    </svg>
  );
}

function PhoneIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  );
}

function MailIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

interface FAQItemData {
  q: string;
  a: string;
  related?: string[];
}

interface FAQCategory {
  id: string;
  title: string;
  faqs: FAQItemData[];
}

const FAQ_CATEGORIES: FAQCategory[] = [
  {
    id: "booking",
    title: "Booking & Payments",
    faqs: [
      {
        q: "How does the booking process work for guided treks in Uttarakhand and Himachal?",
        a: "Booking your Himalayan trekking adventure is seamless. Select your preferred trek and departure batch on our website, fill in your personal and emergency contact details, and proceed to secure online payment. You will receive an instant booking confirmation email with your invoice and pre-trek checklist.",
        related: ["What payment methods do you accept?", "How do I change my trek dates?"],
      },
      {
        q: "What payment methods do you accept for trek reservations?",
        a: "We accept all major credit and debit cards, net banking, UPI (Google Pay, PhonePe, Paytm), and major wallet providers through our secure payment gateway. For international participants, bank wire transfers can also be arranged by contacting our support team directly.",
        related: ["Is my payment secure?", "Can I pay in installments?"],
      },
      {
        q: "When will I receive my official booking confirmation?",
        a: "Booking confirmations are generated instantly upon successful payment. Within 2 hours, our operations team sends out a comprehensive welcome dossier containing reporting times, pickup locations, detailed packing guides, and your dedicated trek leader's contact details.",
        related: ["What is included in the welcome dossier?", "Who do I contact after booking?"],
      },
      {
        q: "Can I change my trek departure date after booking?",
        a: "Yes, you can request a batch change up to 7 days before your original departure date, subject to batch availability and operational feasibility. A nominal administrative fee may apply. We recommend reviewing our cancellation policy for specific guidelines.",
        related: ["What is the cancellation policy?", "Can I transfer my booking to a friend?"],
      },
      {
        q: "Do you offer special discounts for group or corporate treks?",
        a: "Absolutely! We offer tiered discounts for group bookings of 5 or more participants. For corporate retreats, team-building expeditions, or college outdoor clubs in Uttarakhand and Himachal, we curate custom itineraries with dedicated support staff. Reach out to our team for a tailored quote.",
        related: ["How do I book a private trek?", "What is the maximum group size?"],
      },
      {
        q: "Can I transfer my trek booking to another person?",
        a: "Yes, you may transfer your slot to another individual up to 10 days before the trek commences. The substitute trekker must fulfill the medical and physical fitness requirements specified for that particular Himalayan route.",
        related: ["What are the fitness requirements?", "Can I change my trek dates?"],
      },
      {
        q: "How are refunds handled if I cancel my trek?",
        a: "Refunds are processed in accordance with our transparent cancellation timeline. Eligible amounts are credited directly to your original payment method within 7 to 10 business days. Non-recoverable expenses like permits already procured are deducted as outlined in our policy.",
        related: ["What is the cancellation timeline?", "Are booking fees refundable?"],
      },
    ],
  },
  {
    id: "fitness",
    title: "Trek Difficulty & Fitness",
    faqs: [
      {
        q: "Which Himalayan treks are best suited for absolute beginners?",
        a: "If you are stepping onto mountain trails for the first time, beginner-friendly snow treks like Kedarkantha, Brahmatal, or Nag Tibba in Uttarakhand, as well as Triund and Kareri Lake in Himachal, are ideal. These routes offer moderate inclines, stunning alpine views, and manageable daily walking distances.",
        related: ["How should I prepare physically before trekking?", "What is the age limit for beginners?"],
      },
      {
        q: "What level of physical fitness is required for high-altitude trekking?",
        a: "High-altitude trekking demands cardiovascular endurance and leg strength. We recommend starting a cardio regimen (running, cycling, or brisk swimming) 4 to 6 weeks before your trek. Being able to jog 5 km in 35 minutes comfortably prepares your heart and lungs for thin mountain air.",
        related: ["What training plan should I follow?", "How do I prevent altitude sickness?"],
      },
      {
        q: "What are the age limits for participating in your treks?",
        a: "Participants generally need to be at least 10 years old for easy-to-moderate treks, accompanied by a parent or legal guardian. For strenuous or high-altitude alpine passes exceeding 13,000 feet, the minimum age is 14 years. There is no strict upper age limit provided you possess good cardiovascular health and doctor clearance if needed.",
        related: ["Can children and families join?", "Are senior citizens allowed on treks?"],
      },
      {
        q: "Do you accommodate senior citizens on Himalayan treks?",
        a: "Yes! Many active senior trekkers in their 50s and 60s join our scenic valley and ridge treks like Valley of Flowers or Bhrigu Lake. We advise consulting your physician beforehand and informing our trek leaders of any pre-existing health conditions.",
        related: ["What medical conditions require clearance?", "How do trek leaders support participants?"],
      },
      {
        q: "What medical conditions should be declared before embarking on a trek?",
        a: "Transparency regarding your health is crucial for safety at altitude. You must declare asthma, epilepsy, chronic bronchitis, heart ailments, severe joint injuries, or high blood pressure during registration. Carrying prescribed medications and a doctor's fitness certificate is mandatory for chronic conditions.",
        related: ["What first aid do trek leaders carry?", "How is altitude sickness handled?"],
      },
      {
        q: "How should I structure my training plan weeks before departure?",
        a: "Begin your preparation 6 weeks out. Dedicate 3 days a week to cardiovascular training (running or stair climbing) and 2 days to core and lower-body strength exercises (squats, lunges, plank holds). Weekend hikes with a loaded backpack simulate trail conditions perfectly.",
        related: ["What fitness level is required?", "How do I build stamina for altitude?"],
      },
    ],
  },
  {
    id: "uttarakhand",
    title: "Uttarakhand Treks",
    faqs: [
      {
        q: "What makes Kedarkantha Trek one of India's premier winter snow treks?",
        a: "Kedarkantha Trek in the Govind Wildlife Sanctuary, Uttarakhand, offers pristine pine forests, snow-covered meadows, and a breathtaking 360-degree Himalayan summit panorama at 12,500 feet. It is celebrated for reliable winter snow from December to April and an unforgettable summit sunrise.",
        related: ["When is the best time for Kedarkantha?", "Is Kedarkantha suitable for first-timers?"],
      },
      {
        q: "When is the best time to experience Valley of Flowers National Park?",
        a: "Valley of Flowers blooms in its full majesty during the monsoon season from July to August. UNESCO World Heritage-listed, this vibrant alpine valley in Uttarakhand showcases over 500 species of wild Himalayan flora nestled against snow-capped peaks.",
        related: ["How difficult is the Valley of Flowers trek?", "What weather can I expect during monsoon?"],
      },
      {
        q: "Why is Har Ki Dun known as the cradle of the Himalayas?",
        a: "Har Ki Dun is a legendary hanging valley in Uttarakhand steeped in mythological lore and ancient wooden villages. Surrounded by towering peaks like Swargarohini and Bandarpoonch, it offers a rich cultural trekking experience combined with gentle alpine terrain.",
        related: ["What is the maximum altitude of Har Ki Dun?", "Best season to visit Har Ki Dun"],
      },
      {
        q: "What are the key highlights of the Brahmatal Ridge Trek?",
        a: "Brahmatal is famous for its frozen alpine lake, mesmerizing campsites perched beneath star-filled Himalayan skies, and uninterrupted views of snow giants like Mt. Trishul and Nanda Ghunti. It stands out as a premier winter snow trekking destination in Uttarakhand.",
        related: ["How cold does it get at Brahmatal?", "Is Brahmatal good for beginners?"],
      },
      {
        q: "What can I expect from the Kuari Pass Bugyal Trek?",
        a: "Kuari Pass, famously known as the Curzon Trail, takes you across sweeping high-altitude meadows (bugyals) with majestic amphitheater views of Kamet, Dronagiri, and Nanda Devi. It is a photographer's paradise and an incredible moderate-grade Himalayan adventure.",
        related: ["What is the highest altitude on Kuari Pass?", "Best months for Kuari Pass"],
      },
    ],
  },
  {
    id: "himachal",
    title: "Himachal Pradesh Treks",
    faqs: [
      {
        q: "What makes Hampta Pass Trek a diverse alpine crossing in Himachal?",
        a: "Hampta Pass bridges the lush green Kullu Valley with the stark, dramatic desert landscapes of Lahaul and Spiti. Trekkers experience dense pine forests, cascading waterfalls, glacial streams, and crossing a 14,000-foot mountain pass in a single expedition.",
        related: ["Are there river crossings on Hampta Pass?", "What is the best season for Hampta Pass?"],
      },
      {
        q: "Why is Bhrigu Lake Trek famous for its glacial waters and meadows?",
        a: "Bhrigu Lake sits at an altitude of 14,100 feet above Manali. It is renowned for its high-altitude glacial tarn that changes color with the seasons and endless carpet-like green meadows that offer panoramic vistas of the Pir Panjal and Dhauladhar ranges.",
        related: ["How strenuous is Bhrigu Lake Trek?", "Can beginners do Bhrigu Lake?"],
      },
      {
        q: "What is the historical and geographical significance of Beas Kund?",
        a: "Beas Kund is the sacred glacial source of the River Beas in Solang Valley, Himachal Pradesh. Surrounded by towering peaks like Shitidhar and Ladakhi, this moderate trek offers pristine alpine beauty and rich mythological heritage.",
        related: ["How long does Beas Kund trek take?", "Best time to visit Beas Kund"],
      },
      {
        q: "What makes Kareri Lake a pristine weekend trek in Himachal?",
        a: "Kareri Lake is a high-altitude freshwater shallow lake fed by snowmelt from the Dhauladhar range. Lined with oak and pine forests and dotted with gushing streams, it provides an authentic wilderness camping experience close to Dharamshala.",
        related: ["Is Kareri Lake suitable for beginners?", "What is the duration of Kareri Lake trek?"],
      },
      {
        q: "Why is Triund Trek popular for weekend adventurers in McLeod Ganj?",
        a: "Triund is the quintessential beginner trek in Himachal Pradesh. Situated atop a ridge overlooking the Kangra Valley and the snow-clad Dhauladhar massif, it offers accessible yet rewarding mountain camping under starry skies.",
        related: ["How long is the hike to Triund?", "Can I do Triund without a guide?"],
      },
    ],
  },
  {
    id: "travel",
    title: "Travel & Transportation",
    faqs: [
      {
        q: "What are the designated pickup locations for Uttarakhand and Himachal treks?",
        a: "For Uttarakhand treks (Kedarkantha, Brahmatal, Valley of Flowers, etc.), pickups generally originate from Dehradun Railway Station. For Himachal treks (Hampta Pass, Bhrigu Lake, etc.), pickups originate from Manali or Chandigarh depending on the itinerary. Exact reporting times are shared in your welcome dossier.",
        related: ["What happens if my flight or train is delayed?", "Do you arrange return transport?"],
      },
      {
        q: "How should I plan my arrival at the base camp?",
        a: "We recommend arriving at the pickup city (Dehradun, Chandigarh, or Delhi) at least one day prior to the trek start date. This allows your body to adjust to regional transit and ensures you reach our reporting point on time without rushing.",
        related: ["What are recommended travel options?", "Can I park my vehicle at the base camp?"],
      },
      {
        q: "What happens if my train or flight is delayed on reporting day?",
        a: "If transit delays occur, inform our operations team immediately. While our scheduled group vehicles depart on time, we will guide you on how to catch up with the team via local cabs or public transport at additional cost.",
        related: ["What is the reporting time?", "Who do I call in case of delays?"],
      },
      {
        q: "Is parking available if I drive my own vehicle to the base camp?",
        a: "Yes, secure parking arrangements can usually be coordinated at base camp villages or local hotels in Dehradun or Manali at nominal daily parking fees. Please inform our support team in advance if you plan to drive.",
        related: ["Where is the base camp reporting point?", "Are transport costs included in trek fees?"],
      },
      {
        q: "How is the return journey planned after trek completion?",
        a: "Return transport from the trek drop-off point back to the base camp city (Dehradun or Manali) is included in your package. We typically arrive back between 3:00 PM and 6:00 PM on the final day. Book your return trains or flights departing late evening or the following morning.",
        related: ["What time does the trek finish on the last day?", "Can I book return tickets in advance?"],
      },
    ],
  },
  {
    id: "accommodation",
    title: "Accommodation & Camping",
    faqs: [
      {
        q: "What type of accommodation is provided during the trek?",
        a: "During the trek, you will stay in high-quality, weather-resistant dome tents on a twin or triple-sharing basis, equipped with thick insulating sleeping mats and warm sleeping bags rated for sub-zero temperatures. On select itineraries, guesthouse or homestay stays are included.",
        related: ["Can I get a private tent?", "What are the campsite facilities like?"],
      },
      {
        q: "Are washroom facilities available at high-altitude campsites?",
        a: "Yes, we set up hygienic, eco-friendly trench toilets (nature-friendly dry pit latrines) at every campsite with proper privacy enclosures, hand sanitizers, and toilet paper. Water is provided for wash hygiene.",
        related: ["How do we maintain hygiene on the trail?", "Are there concrete restrooms?"],
      },
      {
        q: "Is electricity or mobile device charging available at campsites?",
        a: "High-altitude Himalayan campsites do not have grid electricity. We carry power banks and solar charging packs for emergency communications and medical equipment. We strongly recommend carrying your own fully charged power banks and spare camera batteries.",
        related: ["Is mobile network available on treks?", "How do I keep my phone charged?"],
      },
      {
        q: "What is the mobile network connectivity like on Uttarakhand and Himachal trails?",
        a: "Mobile connectivity (BSNL, Jio, Airtel) is generally available during the first day of transit and base camp, but fades entirely once you ascend into alpine forests and high-altitude valleys. Enjoy the digital detox!",
        related: ["Can I rent a satellite phone?", "How do family members contact me in emergency?"],
      },
      {
        q: "How is drinking water sourced and purified on the trek?",
        a: "Our mountain staff sources fresh natural spring water along the trail. This water is boiled and filtered through advanced sediment and chemical purification systems before being served to trekkers, ensuring absolute safety against waterborne illnesses.",
        related: ["Should I carry a reusable water bottle?", "Is mineral water available on trails?"],
      },
    ],
  },
  {
    id: "food",
    title: "Food & Meals",
    faqs: [
      {
        q: "What kind of meals are served during Himalayan treks?",
        a: "We serve wholesome, freshly prepared vegetarian meals designed by nutritionists to fuel your mountain adventure. Expect a balanced mix of Indian, continental, and pahadi cuisines including porridge, poha, dal, sabzi, chapati, rice, nutritious soups, and hot desserts.",
        related: ["Do you cater to vegan or Jain dietary requirements?", "Are hot beverages provided?"],
      },
      {
        q: "Can you accommodate vegan, gluten-free, or Jain dietary preferences?",
        a: "Yes! Please mention your dietary requirements while booking. Our kitchen crew prepares separate Jain meals (without onion and garlic) and vegan-friendly options upon prior notice.",
        related: ["What snacks should I carry?", "How is food hygiene maintained on the trail?"],
      },
      {
        q: "Are hot beverages and snacks provided during trekking hours?",
        a: "Hot tea, herbal infusions, and coffee are served at breakfast, evening camp arrival, and dinner. Healthy trail snacks like dry fruits, energy bars, and freshly cooked evening soups keep your energy high throughout the day.",
        related: ["What meals are included on summit day?", "Do I need to carry cooking gear?"],
      },
      {
        q: "How is kitchen hygiene maintained at high-altitude base camps?",
        a: "Our expedition chefs and kitchen staff strictly adhere to rigorous hygiene standards. All cooking utensils are sanitized with boiling water, raw ingredients are fresh and locally sourced, and food handling protocols meet professional catering guidelines.",
        related: ["What water purification methods are used?", "Who cooks the food on the trail?"],
      },
    ],
  },
  {
    id: "gear",
    title: "Trek Gear & Packing",
    faqs: [
      {
        q: "What items are included in your comprehensive packing checklist?",
        a: "Your packing checklist should include waterproof trekking shoes with ankle support, 3 layers of warm clothing (thermal inner, fleece jacket, waterproof outer shell), moisture-wicking trek pants, woolen gloves, UV sunglasses, headlamp, and a 50–60L backpack.",
        related: ["Can I rent trekking gear from you?", "What shoes are best for snow treks?"],
      },
      {
        q: "Can I rent trekking shoes, jackets, and poles from base camp?",
        a: "Yes! We offer high-quality gear rental services at our base camps for trekking poles, waterproof jackets, snow gaiters, and microspikes. Please reserve gear items in advance during booking to guarantee availability.",
        related: ["What gear is mandatory for winter treks?", "How heavy should my backpack be?"],
      },
      {
        q: "Why are proper ankle-support trekking shoes non-negotiable?",
        a: "Himalayan trails feature uneven rocky terrain, scree, loose soil, and snow. Waterproof trekking shoes with deep lugged soles provide essential grip and ankle stability, preventing sprains and blisters.",
        related: ["Can I wear running shoes for trekking?", "How do I break in new trekking boots?"],
      },
      {
        q: "What kind of backpack size is recommended for multi-day treks?",
        a: "A 50 to 60-liter rucksack with an ergonomic hip belt is ideal. If you prefer offloading your main backpack to our mules or porters (where permitted), a smaller 20–30L daypack is sufficient to carry your water bottle, poncho, and fleece layer.",
        related: ["Can I offload my backpack to mules?", "How to pack light for a trek?"],
      },
    ],
  },
  {
    id: "weather",
    title: "Weather & Seasons",
    faqs: [
      {
        q: "What is the best season for trekking in Uttarakhand and Himachal Pradesh?",
        a: "The Indian Himalayas offer year-round trekking opportunities depending on your preference. Summer (May–June) brings pleasant weather and blooming flowers; Monsoon (July–August) transforms valleys lush green; Autumn (September–November) offers crystal-clear skies; Winter (December–March) provides magical snow landscapes.",
        related: ["When does snowfall happen in Uttarakhand?", "How cold does it get at night?"],
      },
      {
        q: "What temperature ranges can I expect during Himalayan treks?",
        a: "Summer daytime temperatures range between 15°C to 22°C, dropping to 5°C at night. In winter, daytime temperatures hover around 5°C to 12°C, while nighttime temperatures at high-altitude campsites frequently plummet to -5°C to -12°C.",
        related: ["What thermal wear do I need for winter treks?", "How do you stay warm in sub-zero tents?"],
      },
      {
        q: "How do you handle sudden weather emergencies or heavy rain?",
        a: "Safety is our foremost priority. Our trek leaders monitor real-time weather forecasts continuously. In case of unexpected storms or heavy snowfall, itineraries may be modified, shelter sought at safe altitudes, or alternate routes utilized with experienced mountain guides.",
        related: ["What safety equipment do trek leaders carry?", "Are emergency evacuations covered?"],
      },
      {
        q: "Is trekking safe during the monsoon season in Uttarakhand?",
        a: "Monsoon trekking requires caution due to slippery trails and occasional landslides in lower valleys. However, high-altitude alpine routes like Valley of Flowers or Hampta Pass are exceptionally vibrant. Our experienced leaders navigate trails with meticulous safety protocols.",
        related: ["What rain gear should I pack?", "Which treks are open during monsoon?"],
      },
    ],
  },
  {
    id: "safety",
    title: "Safety & Medical Support",
    faqs: [
      {
        q: "What medical certifications and training do your trek leaders possess?",
        a: "All our lead guides are certified Mountaineering graduates from premier institutes (like NIM Uttarkashi or ABVIMAS Manali) and hold advanced Wilderness First Responder (WFR) and CPR certifications. They carry extensive experience navigating high-altitude Himalayan terrain.",
        related: ["What emergency medical equipment is carried?", "How do you handle acute mountain sickness?"],
      },
      {
        q: "What emergency equipment and medical kits do you carry on every trek?",
        a: "Every trek is equipped with comprehensive first aid trauma kits, pulse oximeters to monitor blood-oxygen levels twice daily, portable oxygen cylinders, stretchers, and emergency communication radios or satellite links where cellular networks fail.",
        related: ["What are the symptoms of altitude sickness?", "When is an emergency evacuation triggered?"],
      },
      {
        q: "How do trek leaders manage Acute Mountain Sickness (AMS)?",
        a: "Our leaders conduct daily health screenings including oxygen saturation and pulse checks. If early symptoms of AMS appear (headache, nausea, dizziness), immediate descent protocol is initiated, assisted by supplemental oxygen and expert mountain staff guidance.",
        related: ["How to prevent altitude sickness naturally?", "What medicines should I carry for AMS?"],
      },
      {
        q: "What is the protocol for emergency medical evacuation?",
        a: "In severe medical emergencies, our trek leader coordinates immediate evacuation to the nearest motorable road head or medical outpost using local rescue teams, stretcher bearers, and emergency vehicles, backed by our 24/7 base operations command center.",
        related: ["Do I need travel insurance for trekking?", "Who bears evacuation expenses?"],
      },
    ],
  },
  {
    id: "women",
    title: "Women Trekkers",
    faqs: [
      {
        q: "Are Himalayan treks safe for solo female travelers?",
        a: "Yes, absolutely! Thousands of solo women trekkers join our expeditions across Uttarakhand and Himachal every year. Our secure group environment, verified support staff, and professional female/male trek leaders ensure an empowering, welcoming, and safe atmosphere.",
        related: ["Do you have female trek leaders?", "How are tent allocations managed for solo women?"],
      },
      {
        q: "Do you have certified female trek leaders and support staff?",
        a: "Yes, we proudly feature certified female trek leaders, nature guides, and camp coordinators on many of our popular Himalayan routes, promoting inclusivity and expert mentorship on the trail.",
        related: ["What privacy facilities are available at campsites?", "How do you manage menstrual hygiene on treks?"],
      },
      {
        q: "How are tent accommodations assigned for solo women trekkers?",
        a: "Solo female trekkers are paired with other female participants in shared dome tents. If you prefer absolute privacy, single tent upgrades can be requested during booking subject to availability.",
        related: ["Are there separate toilet tents for women?", "What hygiene products should I pack?"],
      },
      {
        q: "How do I manage menstrual hygiene during multi-day Himalayan treks?",
        a: "Managing periods on the trail is straightforward with proper planning. We recommend carrying eco-friendly sanitary products, biodegradable disposal bags, wet wipes, and pain relief medication. Our dedicated toilet tents and clean water supply ensure absolute comfort and privacy.",
        related: ["Can I trek during my period?", "What disposal facilities are available at camps?"],
      },
    ],
  },
  {
    id: "experience",
    title: "Trek Experience",
    faqs: [
      {
        q: "What does a typical daily trekking routine look like on the trail?",
        a: "Days begin early around 6:00 AM with hot tea and mountain views. After breakfast and a quick stretching session, we start trekking by 7:30 AM. We cover most distance during the cool morning hours, reach our next campsite by afternoon for a hot lunch, and spend evenings exploring or stargazing.",
        related: ["How many hours do we walk each day?", "What happens on summit day?"],
      },
      {
        q: "How many hours and kilometers do we typically walk each day?",
        a: "Daily trekking involves 4 to 7 hours of walking across 6 to 12 kilometers of mountainous terrain, depending on altitude gain and trail gradients. Summit push days are longer, often starting pre-dawn and lasting 8 to 10 hours.",
        related: ["How difficult is summit day?", "What is the pace of the trek group?"],
      },
      {
        q: "Are campfires and evening group activities organized at campsites?",
        a: "While traditional campfires are restricted in eco-sensitive wildlife zones to protect Himalayan forests, our evenings feature engaging group storytelling sessions, stargazing workshops, trivia games, and delicious hot meals inside our dining tents.",
        related: ["Can I bring musical instruments?", "What time do lights go out at camp?"],
      },
      {
        q: "What photography opportunities can I expect in Uttarakhand and Himachal?",
        a: "The Himalayas offer endless photographic masterpieces—golden hour sunrises hitting snowy peaks, star-studded Milky Way galactic cores over alpine tents, vibrant wildflower meadows, and candid portraits of pahadi culture and mountain wildlife.",
        related: ["How do I keep camera batteries charged in cold?", "Are drones permitted on treks?"],
      },
    ],
  },
  {
    id: "sustainable",
    title: "Sustainable Trekking",
    faqs: [
      {
        q: "What is your Leave No Trace (LNT) policy on mountain trails?",
        a: "We strictly adhere to Leave No Trace principles. Every wrapper, plastic bottle, and scrap of waste generated by our trekking groups is packed back down to the base camp for responsible recycling. We leave pristine wilderness untouched.",
        related: ["How do you maintain plastic-free treks?", "How do you support local mountain communities?"],
      },
      {
        q: "How do you ensure plastic-free operations across all expeditions?",
        a: "Single-use plastic bottles, plastic cutlery, and non-biodegradable packaging are strictly banned on our treks. We provide large filtered water drums for refilling your personal bottles and utilize eco-friendly cloth and metal storage containers.",
        related: ["What waste management practices do you follow?", "How can trekkers contribute to eco-tourism?"],
      },
      {
        q: "How do your trekking expeditions support local Himalayan communities?",
        a: "We believe in regenerative tourism. All our local guides, expedition chefs, porters, and mule handlers are hired directly from Himalayan villages in Uttarakhand and Himachal, ensuring fair wages, gear support, and sustainable economic empowerment.",
        related: ["How do you protect local flora and fauna?", "What is responsible tourism in the Himalayas?"],
      },
    ],
  },
  {
    id: "photography",
    title: "Photography & Adventure",
    faqs: [
      {
        q: "What are the best spots for astrophotography and landscape photography?",
        a: "High-altitude campsites like Brahmatal lake basin, Kedarkantha summit ridge, and Hampta Pass meadows offer pitch-black night skies devoid of light pollution, making them world-class locations for capturing the Milky Way and snow peak silhouettes.",
        related: ["How do I protect camera gear from sub-zero cold?", "Are drone flights allowed on treks?"],
      },
      {
        q: "Are drone flights permitted during Himalayan treks?",
        a: "Drone usage is subject to strict state regulations, forest department permits, and wildlife sanctuary rules in Uttarakhand and Himachal Pradesh. Flying drones over military zones or wildlife reserves is illegal. Always consult your trek leader before launching any drone.",
        related: ["How do I charge camera batteries in remote camps?", "What camera gear is recommended?"],
      },
      {
        q: "How do freezing temperatures affect camera batteries and electronic gear?",
        a: "Sub-zero mountain temperatures drain lithium-ion batteries rapidly. Keep your spare camera and phone batteries inside your inner jacket pocket close to your body heat. Carry microfiber cloths to wipe condensation when transitioning from cold tents into warm dining areas.",
        related: ["What lens is best for Himalayan landscapes?", "How do I store memory cards safely?"],
      },
    ],
  },
  {
    id: "popular_specific",
    title: "Popular Trek Specific FAQs",
    faqs: [
      {
        q: "Kedarkantha Trek: Best season, highest altitude, and beginner suitability",
        a: "Kedarkantha peaks at 12,500 feet and is open year-round, with December to April offering peak snow experiences. It is rated as easy-to-moderate, making it the ultimate first-time winter snow trek in Uttarakhand with stunning pine forests and summit sunrise views.",
        related: ["View Kedarkantha Trek itinerary", "What gear do I need for Kedarkantha?"],
      },
      {
        q: "Valley of Flowers: Best time, duration, and flora highlights",
        a: "The Valley of Flowers trek in Uttarakhand spans 6 days, reaching 14,100 feet at Hemkund Sahib. The best time to visit is July and August during peak monsoon bloom. It is moderately challenging and suitable for nature enthusiasts and botany lovers.",
        related: ["Explore Uttarakhand Treks", "What waterproof gear is needed for monsoon?"],
      },
      {
        q: "Hampta Pass: Crossing from Kullu Valley to Lahaul & Spiti",
        a: "Hampta Pass reaches 14,100 feet over a 5-day itinerary from June to October. It features a dramatic transition from lush green Kullu valleys to barren Spiti landscapes, including a thrilling high-altitude river crossing and glacier trek.",
        related: ["Explore Himachal Treks", "Is Hampta Pass suitable for beginners?"],
      },
      {
        q: "Bhrigu Lake: High-altitude glacial tarn near Manali",
        a: "Bhrigu Lake sits at 14,100 feet near Manali, Himachal Pradesh. Spanning 4 days from May to October, this trek is famous for its vast emerald meadows and frozen glacial lake views. It is moderately challenging and rewarding for fit beginners.",
        related: ["View Himachal Treks", "What is the best training plan for Bhrigu Lake?"],
      },
      {
        q: "Brahmatal Trek: Frozen lake and massive summit views",
        a: "Brahmatal Trek in Uttarakhand reaches 12,250 feet across 6 days from December to March. Celebrated for its frozen lake camping and close-up views of Mt. Trishul and Nanda Ghunti, it is an exceptional winter snow wonderland for novice trekkers.",
        related: ["View Brahmatal Itinerary", "What temperature to expect at Brahmatal?"],
      },
    ],
  },
  {
    id: "support",
    title: "Contact & Support",
    faqs: [
      {
        q: "How can I talk directly to a Trek Expert to plan my Himalayan expedition?",
        a: "Our seasoned trek experts are available 7 days a week to help you choose the right route based on your fitness, season, and preferences. You can reach us instantly via WhatsApp, phone call, or email.",
        related: ["What are your office operating hours?", "Where are your offices located?"],
      },
      {
        q: "What are your customer support operating hours and emergency contact channels?",
        a: "Our main office operates Monday through Saturday from 9:00 AM to 7:00 PM IST. For active treks on the mountain, our emergency operations command center provides 24/7 dedicated support to our trek leaders and families.",
        related: ["How do I reach WhatsApp support?", "What is your official email address?"],
      },
    ],
  },
];

export default function FAQPage() {
  const [activeTab, setActiveTab] = useState("booking");
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<string | null>("booking-0");

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return FAQ_CATEGORIES.map((cat) => ({
        ...cat,
        faqs: cat.id === activeTab ? cat.faqs : [],
      })).filter((cat) => cat.faqs.length > 0);
    }

    const query = searchQuery.toLowerCase();
    return FAQ_CATEGORIES.map((cat) => ({
      ...cat,
      faqs: cat.faqs.filter(
        (faq) =>
          faq.q.toLowerCase().includes(query) ||
          faq.a.toLowerCase().includes(query)
      ),
    })).filter((cat) => cat.faqs.length > 0);
  }, [searchQuery, activeTab]);

  return (
    <div className="min-h-screen bg-white dark:bg-background">
      {/* ─── Hero Section ─── */}
      <section className="relative min-h-[280px] sm:min-h-[320px] flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1400&q=80"
          alt="Himalayan landscape"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/75 via-[#0F172A]/50 to-[#0F172A]/85" />
        <div className="relative z-10 text-center px-4 sm:px-6 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6"
          >
            <span className="text-xs sm:text-sm font-medium text-white/95">
              Knowledge Base &amp; Help Center
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight"
          >
            Frequently Asked Questions
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/80 text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Everything you need to know about trekking in Uttarakhand and Himachal
            Pradesh — from booking and fitness to gear, safety, and trail experiences.
          </motion.p>
        </div>
      </section>

      {/* ─── Search & Navigation Bar ─── */}
      <section className="sticky top-20 z-30 bg-white/90 dark:bg-card/90 backdrop-blur-md border-b border-gray-100 dark:border-white/10 py-3 sm:py-4 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          {/* Search Bar */}
          <div className="relative w-full sm:w-72 flex-shrink-0">
            <SearchIcon className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted" />
            <input
              type="text"
              placeholder="Search your question..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface dark:bg-background border border-gray-200 dark:border-white/10 rounded-xl sm:rounded-2xl pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm text-foreground placeholder-muted outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>

          {/* Category Tabs (scrollable on mobile) */}
          <div className="w-full sm:w-auto overflow-x-auto hide-scrollbar flex items-center gap-1.5 sm:gap-2 py-0.5">
            {FAQ_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveTab(cat.id);
                  setSearchQuery("");
                }}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-heading text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === cat.id && !searchQuery
                    ? "bg-primary text-white shadow-md shadow-primary/25"
                    : "bg-surface dark:bg-white/5 text-muted hover:text-foreground hover:bg-gray-200 dark:hover:bg-white/10"
                }`}
              >
                {cat.title}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ Content Section ─── */}
      <section className="py-section-sm px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {filteredCategories.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 sm:py-20"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                <SearchIcon className="w-8 h-8" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-foreground mb-2">
                No matching questions found
              </h3>
              <p className="text-muted max-w-md mx-auto mb-6">
                We couldn&apos;t find anything matching &ldquo;{searchQuery}&rdquo;. Try another search term or reach out to our trek experts.
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors"
              >
                Clear Search
              </button>
            </motion.div>
          ) : (
            <div className="space-y-12">
              {filteredCategories.map((cat) => (
                <div key={cat.id} className="space-y-6">
                  {searchQuery && (
                    <div className="border-b border-gray-100 dark:border-white/10 pb-2">
                      <h3 className="font-heading text-xl font-bold text-foreground">
                        {cat.title}
                      </h3>
                    </div>
                  )}

                  <StaggerContainer className="space-y-4" staggerDelay={0.05}>
                    {cat.faqs.map((faq, idx) => {
                      const itemKey = `${cat.id}-${idx}`;
                      const isOpen = openIndex === itemKey;

                      return (
                        <StaggerItem key={itemKey}>
                          <motion.div
                            whileHover={{ x: 2 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className={`rounded-2xl overflow-hidden transition-colors duration-200 border ${
                              isOpen
                                ? "bg-primary/5 border-primary/20 shadow-sm"
                                : "bg-white dark:bg-card border-gray-100 dark:border-white/10 hover:border-gray-200 dark:hover:border-white/20"
                            }`}
                          >
                            <button
                              onClick={() => setOpenIndex(isOpen ? null : itemKey)}
                              className="w-full flex items-center justify-between p-6 text-left"
                              aria-expanded={isOpen}
                            >
                              <span className="font-heading text-base md:text-lg font-semibold text-foreground pr-4">
                                {faq.q}
                              </span>
                              <motion.div
                                animate={{ rotate: isOpen ? 45 : 0 }}
                                transition={{ duration: 0.2 }}
                                className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center transition-colors ${
                                  isOpen ? "bg-primary text-white" : "bg-surface text-foreground"
                                }`}
                              >
                                <ChevronDownIcon className="h-4 w-4" />
                              </motion.div>
                            </button>

                            <AnimatePresence>
                              {isOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{
                                    duration: 0.3,
                                    ease: [0.25, 0.1, 0.25, 1],
                                  }}
                                >
                                  <div className="px-6 pb-6 pt-2 border-t border-gray-100 dark:border-white/10 space-y-4">
                                    <p className="text-muted text-base leading-relaxed">
                                      {faq.a}
                                    </p>

                                    {faq.related && faq.related.length > 0 && (
                                      <div className="pt-3 border-t border-gray-100 dark:border-white/10 flex flex-wrap items-center gap-2">
                                        <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">
                                          Related:
                                        </span>
                                        {faq.related.map((rel, rIdx) => (
                                          <span
                                            key={rIdx}
                                            className="text-xs bg-surface dark:bg-white/5 text-primary hover:bg-primary/10 px-3 py-1 rounded-full cursor-pointer transition-colors font-medium"
                                          >
                                            {rel}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        </StaggerItem>
                      );
                    })}
                  </StaggerContainer>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── Final CTA Section ─── */}
      <section className="py-section-sm px-4 sm:px-6 lg:px-8 bg-surface dark:bg-background">
        <div className="max-w-4xl mx-auto">
          <FadeUp>
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary via-emerald-600 to-emerald-700 p-8 sm:p-10 md:p-14 text-center">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />

              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-6 text-white">
                  <MessageCircleIcon className="w-8 h-8" />
                </div>
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-3">
                  Still have questions? Talk to our Trek Experts
                </h2>
                <p className="text-white/80 text-lg max-w-xl mx-auto mb-8">
                  Whether you need help choosing between Uttarakhand snow treks or Himachal alpine passes, we&apos;re here to guide you.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a
                    href="https://wa.me/917817912062"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 bg-white text-emerald-700 font-semibold px-7 py-3.5 rounded-xl hover:bg-white/90 transition-colors shadow-lg"
                  >
                    <MessageCircleIcon className="w-5 h-5" />
                    WhatsApp Support
                  </a>
                  <a
                    href="tel:+917817912062"
                    className="inline-flex items-center gap-2.5 bg-white/15 backdrop-blur-sm text-white font-semibold px-7 py-3.5 rounded-xl border border-white/25 hover:bg-white/25 transition-colors"
                  >
                    <PhoneIcon className="w-5 h-5" />
                    Call Us
                  </a>
                  <a
                    href="mailto:himalayanarcadventure@gmail.com"
                    className="inline-flex items-center gap-2.5 bg-white/15 backdrop-blur-sm text-white font-semibold px-7 py-3.5 rounded-xl border border-white/25 hover:bg-white/25 transition-colors"
                  >
                    <MailIcon className="w-5 h-5" />
                    Email Support
                  </a>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
