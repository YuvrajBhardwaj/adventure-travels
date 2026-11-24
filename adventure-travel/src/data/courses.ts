/** Real Auli course photos (local, in public/assets/skiing). Shared by both skiing courses. */
const SKIING_LOCAL_GALLERY = [
  "/assets/skiing/IMG_4853.WEBP",
  "/assets/skiing/IMG_4963.JPG.jpeg",
  "/assets/skiing/IMG_4965.JPG.jpeg",
  "/assets/skiing/IMG_4974.JPG.jpeg",
  "/assets/skiing/IMG_4976.JPG.jpeg",
  "/assets/skiing/IMG_4992.JPG.jpeg",
  "/assets/skiing/IMG_4993.JPG.jpeg",
  "/assets/skiing/IMG_4994.JPG.jpeg",
  "/assets/skiing/IMG_4995.JPG.jpeg",
  "/assets/skiing/IMG_4996.JPG.jpeg",
  "/assets/skiing/IMG_5006.JPG.jpeg",
  "/assets/skiing/IMG_5009.JPG.jpeg",
  "/assets/skiing/IMG_5016.JPG.jpeg",
  "/assets/skiing/IMG_5017.JPG.jpeg",
  "/assets/skiing/IMG_5021.JPG.jpeg",
  "/assets/skiing/IMG_5022.JPG.jpeg",
  "/assets/skiing/IMG_5028.JPG.jpeg",
  "/assets/skiing/IMG_5035.JPG.jpeg",
  "/assets/skiing/IMG_5036.JPG.jpeg",
  "/assets/skiing/IMG_5038.JPG.jpeg",
];

/** Real Auli course videos (local, in public/assets/skiing). Shared by both skiing courses. */
const SKIING_LOCAL_VIDEOS = [
  "/assets/skiing/IMG_4968.MP4",
  "/assets/skiing/IMG_4973.MP4",
  "/assets/skiing/IMG_4975.MP4",
  "/assets/skiing/IMG_5018.MP4",
  "/assets/skiing/IMG_5025.mp4",
  "/assets/skiing/IMG_5037.MP4",
];

export interface CourseItineraryDay {
  day: number;
  title: string;
  description: string;
}

export interface CourseInclusion {
  icon: string;
  label: string;
  description: string;
  /** Longer text shown in the card's popup. A list renders as bullets. */
  details?: string | string[];
}

/** Pricing/itinerary tier (e.g. Basic vs Premium) for courses sold in packages. */
export interface CourseTier {
  id: string;
  name: string;
  blurb: string;
  /** Price WITHOUT lodging & food */
  priceBase: number;
  /** Price WITH lodging & all meals */
  priceFull: number;
  features: string[];
  itinerary: CourseItineraryDay[];
}

export interface Course {
  id: number;
  name: string;
  slug: string;
  type: "Skiing" | "Snowboarding" | "Backcountry";
  title: string;
  price: number;
  currency: string;
  duration: string;
  dates: string;
  location: string;
  level: string;
  description: string;
  shortDescription: string;
  itinerary: CourseItineraryDay[];
  inclusions: CourseInclusion[];
  image: string;
  gallery?: string[];
  /** Cinematic backdrop video for the course page (real course footage). */
  video?: string;
  featured?: boolean;
  /** ponytail: optional SIA-style fields */
  levelRequirement?: string;
  instructorRatio?: string;
  weeklyHours?: string;
  highlights?: string[];
  /** What a guest can do by a given day, taken from the itinerary. Shown as the skill track on the course page. */
  milestones?: { day: number; skill: string }[];
  /** Multi-tier pricing (Basic/Premium) — falls back to `price` when absent. */
  tiers?: CourseTier[];
  /** Good to know / what to pack / location cards under What's Included. */
  beforeYouGo?: CourseInclusion[];
}

/* ─── Auli ski & snowboard school: shared "What's Included" text (owner copy, 24 Nov 2026) ─── */
const STAY_DETAILS = "Cozy cottage-style rooms with mountain views, a warm place to rest after a day on the slopes. Included only when you book with stay; bookings without stay do not include it.";
const HEATER: CourseInclusion = {
  icon: "heater",
  label: "Room Heater",
  description: "A heater in every room (with stay)",
  details: "Every room has a heater, so you stay warm even on freezing Himalayan nights. Included only when you book with stay; bookings without stay do not include it.",
};
const MEALS_DETAILS = "Fresh, hot breakfast, lunch and dinner every day, so you have the energy for training.";
const INSTRUCTOR_DETAILS = "Learn from experienced instructors who teach you step by step, from your first slide to confident turns.";
const SUPPORT: CourseInclusion = {
  icon: "support",
  label: "Local Support & Guidance",
  description: "Our local team, from arrival to departure",
  details: "Our local team helps with everything from arrival to departure, including directions, weather updates and on-ground support.",
};
const SKI_EQUIPMENT_DETAILS = "Skis, boots and poles are provided during training sessions. You don't need to buy or rent anything.";
const BOARD_EQUIPMENT_DETAILS = "Snowboards and boots are provided during training sessions. You don't need to buy or rent anything.";

const AULI_BEFORE_YOU_GO: CourseInclusion[] = [
  {
    icon: "info",
    label: "Good to Know",
    description: "Beginner-friendly, weather-dependent",
    details: [
      "Beginner-friendly: made for complete beginners, no prior experience needed.",
      "Fitness: you should be in good physical health. Skiing is fun, but it's an active sport.",
      "Choose one: skiing and snowboarding are separate courses. Please confirm which one you want when you book.",
      "Weather-dependent: training depends on snow and weather conditions in Auli. Safety always comes first.",
    ],
  },
  {
    icon: "pack",
    label: "What to Pack",
    description: "Warm layers, gloves, goggles and sunscreen",
    details: [
      "Warm thermal layers and a winter jacket",
      "Waterproof gloves",
      "Sunglasses or snow goggles (snow glare is strong at altitude)",
      "Woollen socks",
      "Sunscreen and lip balm",
      "A cap or beanie",
    ],
  },
  {
    icon: "pin",
    label: "Course Location",
    description: "Auli, near Joshimath, Chamoli district, Uttarakhand",
    details:
      "Auli, near Joshimath, Chamoli district, Uttarakhand. A Himalayan ski destination known for its long slopes, oak and pine forests, and panoramic views of snow-capped peaks.",
  },
];

/* ─── 14-Day International-Style Skiing Course itineraries ─── */
const SKI14_PREMIUM_ITINERARY: CourseItineraryDay[] = [
  { day: 1, title: "Premium Welcome & Personal Ski Assessment", description: "Check-in, welcome briefing, course overview, slope etiquette and a full mountain safety briefing, plus a personal introduction with your instructor, individual skiing goals, an initial skill assessment, a personal progression plan, and premium equipment fitting with individual adjustments." },
  { day: 2, title: "Ski Foundations + Personal Coaching", description: "Warm-up, walking and side-stepping on skis, stance, straight gliding and safe falling, plus an individual balance assessment, personal stance correction, one-to-one instructor feedback and additional practice runs." },
  { day: 3, title: "Snow-Plough & Braking + Video Feedback", description: "Snow-plough position, braking, controlled stops and traversing, plus individual speed-control coaching, technique correction and instructor-led progression drills. Video feedback: selected skiing footage is recorded for technical review." },
  { day: 4, title: "Fundamental Turns + Movement Analysis", description: "Snow-plough turn mechanics, left and right turns and linking basic turns, plus individual turn analysis, body-position correction, turn-initiation coaching and linking-turn drills. Movement-analysis review covering stance, balance, ski alignment and turn mechanics." },
  { day: 5, title: "Edge Control & Traversing + Guided Runs", description: "Advanced beginner edging drills, weight-transfer exercises, terrain-specific coaching and individual technique correction, closing with longer guided runs." },
  { day: 6, title: "Turn Rhythm & Basic Swing + Personal Coaching", description: "Advanced turn drills, rhythm development and body coordination, basic swing development with personal coaching throughout. Video feedback wherever useful." },
  { day: 7, title: "Longer Runs, Confidence & Progression Review", description: "Longer guided runs with continuous skiing, terrain adaptation and speed management under individual coaching, ending with a personal progression review against your Day 1 goals." },
  { day: 8, title: "Parallel Skiing + Technique Review", description: "Parallel stance and alignment, weight transfer, edge engagement and open parallel turns with individual coaching. Video technique review comparing your early-course and current skiing." },
  { day: 9, title: "Parallel Turn Development", description: "Linked parallel turns, turn rhythm, edge control and pole positioning, with short and long turn variations and individual technique refinement." },
  { day: 10, title: "Lift & Mountain Skills + Instructor-Led Runs", description: "Lift training, longer runs and mountain orientation with terrain selection and speed management on instructor-led runs, including individual corrections throughout." },
  { day: 11, title: "Slalom & Agility + Performance Review", description: "Short-turn development, pole use, slalom, rhythm, edge control, directional accuracy and speed management, followed by a performance review where your instructor points out what to work on." },
  { day: 12, title: "Performance Consolidation + Mountain Skills Session", description: "Complete technique revision (parallel, short and long turns, and slalom) with lift practice, longer runs and independent skiing under personal coaching. Mountain skills session: reading terrain, understanding snow conditions, cold-weather management, responsible skiing and basic emergency awareness." },
  { day: 13, title: "Premium Final Assessment + Personal Ski Report", description: "Individual assessment covering equipment handling, balance, stance, gliding, braking, snow-plough, turning, traversing, parallel skiing, short turns, slalom, speed control, lift operation, terrain awareness, safety and overall confidence, with final video analysis (strengths, improvements, body positioning, turn mechanics, next steps). You receive your Personal Ski Report: skill ratings, video analysis and your instructor's remarks. There are no A/B grades." },
  { day: 14, title: "Free Skiing & Premium Graduation", description: "Final warm-up, guided and free skiing with parallel turns, short/long turns and slalom practice, final instructor corrections and group photographs. Graduation: individual performance feedback, the Himalayan Arc Adventure Ski Course Certificate (a private ski school certificate, not a government one) and personal next-level recommendations. The course closes with après-ski tea and snacks and an optional bonfire, weather permitting. Departure: Auli → Joshimath / Dehradun / Rishikesh." },
];

export const courses: Course[] = [
  {
    id: 1,
    name: "7-Day Skiing Course",
    slug: "skiing-course",
    milestones: [
      { day: 2, skill: "Glide, balance and stop under control with the snow-plough" },
      { day: 4, skill: "Link turns down beginner runs without stopping" },
      { day: 5, skill: "Ride the ski lift and take on longer runs" },
      { day: 7, skill: "Ski independently and leave with your course certificate" },
    ],
    type: "Skiing",
    title: "Learn to Ski in the Himalayas",
    price: 23000,
    currency: "Rs.",
    duration: "7 Days",
    dates: "Dec 2026 to Mar 2027",
    location: "Auli, Uttarakhand",
    level: "All Levels",
    levelRequirement: "No prior experience needed. We start from the basics.",
    instructorRatio: "6:1 student-to-instructor ratio",
    weeklyHours: "20+ hours of practical training per week",
    description: "A structured 7-day skiing course on the slopes of Auli, Uttarakhand, for complete beginners and for skiers refining their technique, taught by certified instructors with Nanda Devi (7,816m) behind the runs. You get personal coaching, HD video analysis and a course completion certificate.",
    shortDescription: "Learn to ski with certified instructors on Auli's powder runs, beneath Nanda Devi.",
    highlights: [
      "20+ hours of practical coaching per week from certified instructors",
      "Small group sizes (max 6:1) for personal attention",
      "HD video movement analysis of your technique",
      "Structured weekly progression with personalised evaluations",
      "Full Auli lift pass: cable car & chairlift access",
      "Off-snow seminars: mountain safety, equipment care, snow science",
      "Weekly social après sessions with fellow riders",
      "Course completion certificate",
    ],
    itinerary: [
      { day: 1, title: "Arrive Joshimath & Gear Up", description: "Transfer from Joshimath to Auli. Meet your instructors, get fitted for boots and skis by our equipment specialists, and settle into your room with a mountain view." },
      { day: 2, title: "First Turns on the Nursery Slopes", description: "Ride the Auli cable car up (one of the world's highest) and learn the basics: stance, balance, the snowplough and how to stop with confidence. Afternoon: theory session on mountain safety and weather." },
      { day: 3, title: "Snowplough & Controlled Stops", description: "Build control on gentle gradients: snowplough turns, edging, and safe falling techniques. Afternoon: equipment tuning clinic, where you learn to maintain your own gear." },
      { day: 4, title: "Linking Your Turns", description: "Start linking turns down beginner blue runs. Your instructor films your technique for the afternoon video analysis session, so you can see exactly what to improve." },
      { day: 5, title: "Chairlift & Longer Descents", description: "Take the chairlift for longer runs across Auli's varied terrain. Refine your parallel turns and carry more speed across wider pistes. Afternoon: snow science seminar." },
      { day: 6, title: "Intermediate Slopes & Off-Piste Taster", description: "Progress to steeper runs and a guided taste of soft off-piste powder beneath Nanda Devi. End with a group challenge run and an après session." },
      { day: 7, title: "Assessment & Certification", description: "A final assessed run demonstrating your progression, personalised written evaluation from your Level 4 Pro, the Himalayan Arc Adventure course certificate (a private ski school certificate), and a send-off with the group." },
    ],
    tiers: [
      {
        id: "premium",
        name: "Premium",
        blurb: "More slope time plus HD video analysis, snow-science seminars, après-ski socials, a formal final assessment and a graduation ceremony.",
        priceBase: 23000,
        priceFull: 45000,
        features: [
          "Certificate of completion + graduation ceremony",
          "4–5 hrs practical coaching daily (~25+ hrs total)",
          "HD video movement analysis sessions",
          "Evening seminars: mountain safety, snow science & equipment care",
          "Formal final assessment with personal evaluation",
          "Après-ski social session with optional bonfire",
          "Certified instructors · max 6 students per instructor",
        ],
        itinerary: [
          { day: 1, title: "Arrival, Orientation & Acclimatisation", description: "Joshimath → Auli. Check-in, welcome briefing, introductions and course overview with full safety briefing. Equipment briefing, fitting and adjustment, short acclimatisation walk around Auli. Evening session: mountain safety, weather and snow conditions, ski etiquette and basic terminology. Overnight in Auli. Training: orientation + theory." },
          { day: 2, title: "Skiing Fundamentals & Balance", description: "First practical session after breakfast: warm-up and mobility, walking and side-stepping with skis, basic stance, balance and weight distribution, straight gliding on beginner terrain, safe falling techniques, speed control, snow-plough position and controlled stops, with individual instructor feedback. Evening theory: equipment care, snow conditions and mountain weather. Training: 4–5 hrs." },
          { day: 3, title: "Braking, Snow-Plough & Basic Turns", description: "Snow-plough braking, speed management, traversing and linking left–right turns with correct body position, filmed for movement analysis. Evening HD video analysis session: instructors review footage covering body position, balance, ski alignment and turning technique, with areas to improve. Training: 4–5 hrs." },
          { day: 4, title: "Linked Turns & Slope Confidence", description: "Connect skills into continuous skiing: controlled traversing, linked turns without stopping, intro to parallel position, weight transfer and edging, on terrain matched to ability, plus instructor-led practice runs and personal technique evaluation. Evening seminar on mountain safety & snow science: reading slopes, cold-weather precautions and emergency response. Training: 4–5 hrs." },
          { day: 5, title: "Ski Lift, Longer Runs & Après-Ski", description: "Chairlift orientation (approaching, loading and unloading safely), then guided skiing on longer suitable runs: continuous linked turns, braking at designated points, terrain awareness and multiple corrected practice runs. Evening après-ski social: tea and snacks, group interaction, photos and videos, optional bonfire weather permitting. Training: 4–5 hrs." },
          { day: 6, title: "Independent Skiing & Final Assessment", description: "Independent practice runs within your ability to refine snow-plough and linked turns, parallel fundamentals, controlled stops and slope awareness, followed by the final assessed run covering equipment handling, stance, gliding, braking, directional control, speed management, lift usage and overall confidence. Evening: individual feedback and next-level guidance. Training: 4–5 hrs." },
          { day: 7, title: "Final Ski Session & Graduation Ceremony", description: "A fun final morning of guided practice runs where you demonstrate everything learned, with group photos and videos. Then the Graduation Ceremony: individual performance feedback and the Himalayan Arc Adventure Ski Course Certificate (a private ski school certificate, not a government one). Departure after breakfast towards Joshimath / Dehradun / Rishikesh." },
        ],
      },
    ],
    inclusions: [
      { icon: "structor", label: "Certified Instructor", description: "20+ hrs/week from Level 4 qualified coaches", details: INSTRUCTOR_DETAILS },
      { icon: "equipment", label: "All Equipment", description: "Skis, boots, helmets & poles fitted by specialists", details: SKI_EQUIPMENT_DETAILS },
      { icon: "lift", label: "Lift Passes", description: "Full Auli cable car & chairlift access" },
      { icon: "bed", label: "Swiss Cottage Stay", description: "7 nights in a Swiss cottage with mountain views (with stay)", details: STAY_DETAILS },
      HEATER,
      { icon: "food", label: "All Meals", description: "Breakfast, lunch & dinner included daily", details: MEALS_DETAILS },
      { icon: "certificate", label: "Certification", description: "Course completion certificate + personalised evaluation" },
      { icon: "firstaid", label: "Safety Support", description: "Emergency first aid & mountain rescue protocol" },
      { icon: "photos", label: "HD Video Analysis", description: "Movement analysis + professional course photos" },
      SUPPORT,
    ],
    beforeYouGo: AULI_BEFORE_YOU_GO,
    image: "/assets/skiing/IMG_5035.JPG.jpeg",
    gallery: [
      ...SKIING_LOCAL_GALLERY,
      ...SKIING_LOCAL_VIDEOS,
    ],
    video: "/assets/skiing/IMG_5025.mp4",
  },
  {
    id: 6,
    name: "14-Day International-Style Skiing Course",
    slug: "skiing-intensive-2week",
    milestones: [
      { day: 3, skill: "Control your speed and stop with confidence" },
      { day: 6, skill: "Ski continuously, linking turns with rhythm" },
      { day: 9, skill: "Link parallel turns on longer runs" },
      { day: 13, skill: "Pass the skills assessment and earn your certificate" },
    ],
    type: "Skiing",
    title: "Ski Auli the International Way",
    price: 30000,
    currency: "Rs.",
    duration: "14 Days",
    dates: "Dec 2026 to Mar 2027",
    location: "Auli, Uttarakhand, India",
    level: "Beginner → Basic Intermediate",
    levelRequirement: "No prior experience needed. Open to complete beginners.",
    instructorRatio: "Small groups with daily one-to-one coaching",
    weeklyHours: "International-style progressive ski instruction",
    description: "A 14-day progressive ski course on the slopes of Auli. Move from your first glide to confident parallel turns and slalom across a structured fortnight of balance and foundations, snow-plough control, fundamental turns, edge work, rhythm, lift skills and agility, closing with a formal skills assessment and free-skiing finale. Every place includes a personal progression plan, HD video feedback, daily individual coaching and a personal skiing report.",
    shortDescription: "14 days of international-style ski instruction in Auli, from first glide to parallel turns, with daily one-to-one coaching and HD video feedback.",
    highlights: [
      "International-style progressive syllabus across 14 days / 13 nights",
      "Full arc: gliding → snow-plough → linked turns → parallel → slalom",
      "Lift & mountain-skills day to unlock Auli's longer runs",
      "Day-13 skills assessment with individual instructor feedback",
      "Personal progression plan + HD video feedback",
      "Final video analysis & personal skiing report",
      "Certificate of completion for every participant",
      "Best season Dec–Mar, subject to snow conditions",
    ],
    itinerary: SKI14_PREMIUM_ITINERARY,
    tiers: [
      {
        id: "premium",
        name: "Premium",
        blurb: "The same syllabus taught like a private academy: personal progression plans, HD video reviews, daily one-to-one coaching and a final analysis report.",
        priceBase: 30000,
        priceFull: 60000,
        features: [
          "14-day international-style progression: glide → snow-plough → parallel → slalom",
          "Personal progression plan from Day 1",
          "HD video feedback across the fortnight",
          "Daily individual coaching & technique correction",
          "Final video analysis + personal written skiing report",
          "Premium equipment fitting & adjustments",
          "Graduation ceremony & après-ski bonfire (weather permitting)",
        ],
        itinerary: SKI14_PREMIUM_ITINERARY,
      },
    ],
    inclusions: [
      { icon: "structor", label: "Certified Instructor", description: "International-style progressive coaching, certified", details: INSTRUCTOR_DETAILS },
      { icon: "equipment", label: "All Equipment", description: "Skis, boots, helmets & poles fitted by specialists", details: SKI_EQUIPMENT_DETAILS },
      { icon: "lift", label: "Lift Passes", description: "Full 14-day Auli cable car & chairlift access" },
      { icon: "bed", label: "Swiss Cottage Stay", description: "13 nights in a Swiss cottage with mountain views (with stay)", details: STAY_DETAILS },
      HEATER,
      { icon: "food", label: "All Meals", description: "Breakfast, lunch & dinner included daily (with-stay packages)", details: MEALS_DETAILS },
      { icon: "certificate", label: "Certification", description: "Private ski school certificate + Personal Ski Report (no grades)" },
      { icon: "firstaid", label: "Safety Support", description: "Emergency first aid & mountain rescue protocol" },
      { icon: "photos", label: "HD Video Analysis", description: "Regular movement analysis + professional course photos" },
      SUPPORT,
    ],
    beforeYouGo: AULI_BEFORE_YOU_GO,
    image: "/assets/skiing/IMG_5036.JPG.jpeg",
    gallery: [
      ...SKIING_LOCAL_GALLERY,
      ...SKIING_LOCAL_VIDEOS,
    ],
    video: "/assets/skiing/IMG_5025.mp4",
  },
  {
    id: 2,
    name: "7-Day Snowboarding Course",
    slug: "snowboarding-course",
    milestones: [
      { day: 2, skill: "Control the board and stop on your heel edge" },
      { day: 4, skill: "Link heel-side and toe-side turns" },
      { day: 5, skill: "Learn carving basics on varied snow" },
      { day: 7, skill: "Ride a controlled assessed descent and earn your certificate" },
    ],
    type: "Snowboarding",
    title: "Snowboard the Himalayan Powder",
    price: 35000,
    currency: "Rs.",
    duration: "7 Days",
    dates: "Dec 2026 to Mar 2027",
    location: "Auli, Uttarakhand",
    level: "All Levels",
    levelRequirement: "No prior experience needed. Must be comfortable on snow (skiing or boarding) for intermediate+ courses.",
    instructorRatio: "6:1 student-to-instructor ratio",
    weeklyHours: "20+ hours of practical training per week",
    description: "Learn to snowboard on Auli's powder in Uttarakhand with certified instructors, from your first heel-side turns to carving down intermediate runs below Nanda Devi. The course has 20+ hours of coaching a week, HD video analysis, theory seminars on mountain safety, and a personalised evaluation from your Level 4 Pro.",
    shortDescription: "Snowboard on Himalayan powder in Auli, with certified instruction from first turns to confident riding.",
    highlights: [
      "20+ hours of practical coaching per week from certified instructors",
      "Small group sizes (max 6:1) for personal attention",
      "HD video movement analysis to see your progression",
      "Weekly personalised evaluations from Level 4 Pros",
      "Theory seminars: mountain safety, equipment tuning, snow science",
      "Weekly social après with fellow riders",
      "Full Auli lift pass: cable car & chairlift access",
      "Course completion certificate",
    ],
    itinerary: [
      { day: 1, title: "Arrival & Snowboard Orientation", description: "Arrival and accommodation check-in. Introduction to the instructor and course, snowboard equipment fitting, understanding snowboard, bindings and boots, safety briefing and mountain etiquette. Warm-up and mobility session, basic stance identification, introduction to balancing on the board and practice on flat snow. Focus: getting comfortable with the equipment and snowboard." },
      { day: 2, title: "Balance, Stance & Basic Movement", description: "Warm-up and mobility, correct riding stance, falling and getting back up safely, skate technique, straight glide, heel-edge control, toe-edge introduction, speed control and basic stopping techniques. Focus: learning to control the snowboard rather than simply sliding." },
      { day: 3, title: "Edge Control & Turning", description: "Revision of basic techniques, heel-side and toe-side traversing, edge engagement, speed management, introduction to linked turns, basic J-turns, C-turn progression and controlled riding on beginner terrain. Focus: developing confident turns and edge control." },
      { day: 4, title: "Linked Turns & Mountain Riding", description: "Warm-up and technical drills, linking heel-side and toe-side turns, controlling speed through turns, riding different sections of the slope, line selection, introduction to riding steeper terrain and individual correction by instructor. Focus: becoming a controlled and independent rider." },
      { day: 5, title: "Intermediate Riding Skills", description: "Dynamic turning, improving posture and balance, carving fundamentals, riding variable snow conditions, terrain awareness, lift/tow awareness and mountain etiquette, and introduction to basic freeride concepts, conditions permitting. Focus: improving technique and confidence." },
      { day: 6, title: "Freeride & Advanced Fundamentals", description: "Technical warm-up, edge-control drills, carving progression, introduction to freeride technique, terrain selection, riding natural features safely, individual coaching, and video analysis/session review where conditions and equipment permit. Focus: applying technique in real mountain conditions." },
      { day: 7, title: "Final Riding Day & Assessment", description: "Warm-up, technical revision, individual riding assessment, demonstration of linked turns, edge control and stopping, controlled descent, instructor feedback and course completion assessment. Certificate of participation/completion from Himalayan Arc Adventure. Focus: demonstrating what you have learned and understanding your next progression." },
    ],
    inclusions: [
      { icon: "structor", label: "Certified Instructor", description: "20+ hrs/week from Level 4 qualified coaches", details: INSTRUCTOR_DETAILS },
      { icon: "equipment", label: "All Equipment", description: "Boards, boots, helmets & bindings fitted by specialists", details: BOARD_EQUIPMENT_DETAILS },
      { icon: "lift", label: "Lift Passes", description: "Full Auli cable car & chairlift access" },
      { icon: "bed", label: "Swiss Cottage Stay", description: "7 nights in a Swiss cottage with mountain views (with stay)", details: STAY_DETAILS },
      HEATER,
      { icon: "food", label: "All Meals", description: "Breakfast, lunch & dinner included daily", details: MEALS_DETAILS },
      { icon: "certificate", label: "Certification", description: "Course completion certificate + personalised evaluation" },
      { icon: "firstaid", label: "Safety Support", description: "Emergency first aid & mountain rescue protocol" },
      { icon: "photos", label: "HD Video Analysis", description: "Movement analysis + professional course photos" },
      SUPPORT,
    ],
    beforeYouGo: AULI_BEFORE_YOU_GO,
    image: "/assets/snowboarding/IMG_5472.jpg",
    video: "/assets/snowboarding/IMG_5201.mp4",
    gallery: [
      "/assets/snowboarding/IMG_5472.jpg",
      "/assets/snowboarding/IMG_4063.jpg",
      "/assets/snowboarding/IMG_5455.jpeg",
      "/assets/snowboarding/IMG_5201.mp4",
      "/assets/snowboarding/IMG_0942.mp4",
    ],
    featured: true,
  },
  {
    id: 4,
    name: "2-Week Snowboard Intensive",
    slug: "snowboard-intensive-2week",
    milestones: [
      { day: 3, skill: "Link heel-side turns on gentle terrain" },
      { day: 6, skill: "Link heel-to-toe turns on blue runs" },
      { day: 11, skill: "Carve heel-side and toe-side on groomed slopes" },
      { day: 13, skill: "Pass an assessed run on intermediate terrain and earn your certificate" },
    ],
    type: "Snowboarding",
    title: "2-Week Snowboard Intensive in Auli",
    price: 60000,
    currency: "Rs.",
    duration: "14 Days",
    dates: "Dec 2026 to Feb 2027",
    location: "Auli, Uttarakhand",
    level: "Beginner to Intermediate",
    levelRequirement: "No prior experience needed. Open to complete beginners.",
    instructorRatio: "5:1 student-to-instructor ratio",
    weeklyHours: "25+ hours of practical training per week",
    description: "A 2-week snowboard course in Auli, twice as long as the 7-day course. Go from absolute beginner to confidently carving intermediate blue runs in 14 days of structured training. With 25+ hours of coaching weekly, daily video analysis, theory seminars on mountain safety and avalanche awareness, and a final assessment.",
    shortDescription: "14 days of intensive snowboard training in Auli, from first turns to carving intermediate runs with confidence.",
    highlights: [
      "25+ hours of practical coaching per week, the most training per day of any Indian snow school",
      "Small group sizes (max 5:1) for intensive personal attention",
      "Daily HD video analysis with personalised feedback",
      "Theory seminars: mountain safety, avalanche awareness, weather, equipment",
      "Progressive terrain: nursery → blue → intermediate red runs",
      "Off-snow fitness sessions designed for boarders",
      "Weekly social après with the group",
      "Final assessment + course certificate (private ski school)",
    ],
    itinerary: [
      { day: 1, title: "Arrive & Orientation", description: "Transfer to Auli. Equipment fitting, resort orientation, meet your instructors. Evening: welcome dinner and course overview." },
      { day: 2, title: "Stance & Balance", description: "Nursery slopes: board stance, heel-side edge, falling safely. Afternoon: theory on mountain safety & weather." },
      { day: 3, title: "Heel-Side Turns", description: "Linking heel-side turns on gentle terrain. Video analysis of stance and body position." },
      { day: 4, title: "Toe-Side Introduction", description: "First toe-side attempts on the magic carpet area. Equipment tuning clinic." },
      { day: 5, title: "Toe-Side Turns", description: "Build control on toe-side turns and edge transitions. Afternoon: snow science seminar." },
      { day: 6, title: "Linking Turns", description: "Link heel-to-toe turns on blue runs. Video review of progression." },
      { day: 7, title: "Speed Control & Carving", description: "Refine linked turns, introduce carving technique. Off-snow fitness session." },
      { day: 8, title: "Rest Day / Free Riding", description: "Explore Auli at your own pace. Optional group ride with instructor." },
      { day: 9, title: "Chairlift & Longer Runs", description: "Chairlift access for longer descents. Focus on consistent linked turns across varied terrain." },
      { day: 10, title: "Intermediate Terrain", description: "Progress to steeper blue and easy red runs. Afternoon: avalanche awareness seminar." },
      { day: 11, title: "Carving & Edge Work", description: "Advanced carving drills: heel-side and toe-side carves on groomed terrain." },
      { day: 12, title: "Freestyle Introduction", description: "Terrain park session: ollies, 180s, small boxes. Afternoon: video analysis of freestyle." },
      { day: 13, title: "Final Assessment", description: "Assessed run on intermediate terrain. Personalised written evaluation from your Level 4 Pro." },
      { day: 14, title: "Certification & Departure", description: "Course certificate ceremony, a last après session, and departure." },
    ],
    inclusions: [
      { icon: "structor", label: "Certified Instructor", description: "25+ hrs/week from Level 4 qualified coaches", details: INSTRUCTOR_DETAILS },
      { icon: "equipment", label: "All Equipment", description: "Boards, boots, helmets & bindings fitted by specialists", details: BOARD_EQUIPMENT_DETAILS },
      { icon: "lift", label: "Lift Passes", description: "Full 14-day Auli cable car & chairlift access" },
      { icon: "bed", label: "Swiss Cottage Stay", description: "14 nights in a Swiss cottage with mountain views (with stay)", details: STAY_DETAILS },
      HEATER,
      { icon: "food", label: "All Meals", description: "Breakfast, lunch & dinner included daily", details: MEALS_DETAILS },
      { icon: "certificate", label: "Certification", description: "Private ski school certificate + personalised evaluation" },
      { icon: "firstaid", label: "Safety Support", description: "Emergency first aid & mountain rescue protocol" },
      { icon: "photos", label: "HD Video Analysis", description: "Daily movement analysis + professional course photos" },
      SUPPORT,
    ],
    beforeYouGo: AULI_BEFORE_YOU_GO,
    image: "/assets/snowboarding/IMG_4063.jpg",
    video: "/assets/snowboarding/IMG_4222.mp4",
    gallery: [
      "/assets/snowboarding/IMG_4063.jpg",
      "/assets/snowboarding/IMG_5455.jpeg",
      "/assets/snowboarding/IMG_5472.jpg",
      "/assets/snowboarding/IMG_4222.mp4",
      "/assets/snowboarding/IMG_3983.mp4",
      "/assets/snowboarding/IMG_5220.mp4",
      "/assets/snowboarding/IMG_5272.mp4",
    ],
  },
  {
    id: 3,
    name: "Backcountry Ski & Snowboard Touring",
    slug: "backcountry-skiing",
    milestones: [
      { day: 2, skill: "Skin uphill efficiently, with clean kick turns" },
      { day: 4, skill: "Ski your first untracked backcountry line" },
      { day: 5, skill: "Run a beacon, probe and shovel rescue" },
      { day: 6, skill: "Lead yourself through a full-day tour with several descents" },
    ],
    type: "Backcountry",
    title: "Backcountry Ski & Snowboard Touring Adventure",
    price: 45000,
    currency: "Rs.",
    duration: "7 Days",
    dates: "Jan to Mar 2027",
    location: "Auli, Uttarakhand",
    level: "Intermediate+",
    levelRequirement: "Must link parallel turns on red runs. Some off-piste experience recommended.",
    instructorRatio: "4:1 guide-to-client ratio",
    weeklyHours: "Full-day guided sessions",
    description: "For experienced skiers ready to explore beyond the resort. Ski-tour untracked Himalayan terrain above Auli, learn avalanche safety and ski backcountry lines beneath Nanda Devi.",
    shortDescription: "Backcountry ski touring in Auli with expert guides: avalanche safety, touring technique and untracked powder.",
    highlights: [
      "4:1 guide-to-client ratio for maximum safety",
      "Certified avalanche guide with 15+ years Himalayan experience",
      "AST 1 avalanche safety certification included",
      "Tour untracked backcountry beneath Nanda Devi",
      "Full touring equipment provided: skins, beacons, probes, shovels",
      "Emergency satellite communicator on every trip",
      "Professional photos from the mountains",
    ],
    itinerary: [
      { day: 1, title: "Arrive Joshimath & Safety Briefing", description: "Meet your guides, review avalanche safety protocols, check touring equipment, and settle in." },
      { day: 2, title: "Touring Fundamentals", description: "Learn skinning technique, kick turns, and efficient uphill travel on Auli's gentler slopes." },
      { day: 3, title: "Transition to Downhill", description: "Practice switching from touring to downhill mode, and refine your off-piste technique." },
      { day: 4, title: "First Backcountry Descent", description: "Tour to higher elevations and ski your first untracked backcountry line beneath Nanda Devi." },
      { day: 5, title: "Avalanche Rescue Practice", description: "Hands-on beacon search, probe lines, and shovelling techniques in a controlled environment." },
      { day: 6, title: "Extended Tour & Descent", description: "Full-day tour with several descents through varied terrain." },
      { day: 7, title: "Final Run & Departure", description: "A morning backcountry run, course debrief, and a group lunch before departure." },
    ],
    inclusions: [
      { icon: "structor", label: "Mountain Guide", description: "Certified backcountry & avalanche guide (15+ yrs)" },
      { icon: "equipment", label: "Touring Equipment", description: "Skins, beacons, probes & shovels provided" },
      { icon: "lift", label: "Lift Access", description: "Initial cable car access for touring" },
      { icon: "bed", label: "Accommodation", description: "7 nights in Auli mountain-view stay" },
      { icon: "food", label: "All Meals", description: "Breakfast, lunch & dinner included" },
      { icon: "certificate", label: "Certification", description: "AST 1 avalanche safety certification" },
      { icon: "firstaid", label: "Safety Support", description: "Emergency satellite communicator on every trip" },
      { icon: "photos", label: "Course Photos", description: "Professional shots from the mountains" },
    ],
    image: "/assets/backcountry%20touring/IMG_0711.jpeg",
    video: "/assets/backcountry%20touring/IMG_0670.mp4",
    gallery: [
      "/assets/backcountry%20touring/IMG_0711.jpeg",
      "/assets/backcountry%20touring/IMG_1615.jpeg",
      "/assets/backcountry%20touring/IMG_3991.jpeg",
      "/assets/backcountry%20touring/IMG_5467.jpeg",
      "/assets/backcountry%20touring/IMG_5455.jpg",
      "/assets/backcountry%20touring/IMG_0670.mp4",
      "/assets/backcountry%20touring/IMG_0702.mp4",
      "/assets/backcountry%20touring/IMG_0705.mp4",
      "/assets/backcountry%20touring/IMG_1330.mp4",
      "/assets/backcountry%20touring/IMG_1398.mp4",
      "/assets/backcountry%20touring/IMG_1474.mp4",
      "/assets/backcountry%20touring/IMG_2170.mp4",
      "/assets/backcountry%20touring/IMG_3385.mp4",
    ],
  },
];

/** A course's photos for a card slideshow: the cover first, then its gallery photos (no videos). */
export function coursePhotos(course: { image: string; gallery?: string[] }, max = 6): string[] {
  const photos = (course.gallery ?? []).filter((src) => !/\.(mp4|mov)$/i.test(src) && src !== course.image);
  return [course.image, ...photos].slice(0, max);
}
