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
  "/assets/skiing/IMG_5025.MOV",
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
}

export interface CourseTestimonial {
  name: string;
  location: string;
  text: string;
  rating: number;
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
  testimonials: CourseTestimonial[];
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
  /** Multi-tier pricing (Basic/Premium) — falls back to `price` when absent. */
  tiers?: CourseTier[];
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/* ─── 14-Day International-Style Skiing Course itineraries ─── */
const SKI14_BASIC_ITINERARY: CourseItineraryDay[] = [
  { day: 1, title: "Arrival & Ski Academy Orientation", description: "Theme: welcome to the mountains. Check-in at your Auli accommodation, welcome briefing, introductions to instructors and the group, course overview and progression plan, plus an introduction to Auli's ski terrain. Full equipment fitting (boots, skis, poles, helmet, goggles), equipment handling and care, slope etiquette, mountain safety briefing and basic ski terminology." },
  { day: 2, title: "Ski Foundations — Balance, Movement & Gliding", description: "Ski-specific warm-up, getting comfortable in boots, walking with skis and side-stepping, basic stance with balance and weight distribution, straight gliding and speed awareness, safe falling technique and recovery, finishing with controlled beginner runs. Goal: become comfortable moving on skis." },
  { day: 3, title: "Snow-Plough & Speed Control — Learning to Stop", description: "Review of gliding, then snow-plough position and braking, speed control and controlled stopping, traversing while maintaining balance across the slope, and repeated beginner runs. Goal: control speed and stop confidently." },
  { day: 4, title: "Fundamental Turns — Changing Direction", description: "Snow-plough turn mechanics, left and right turns, turn initiation and directional control, weight distribution through the turn, speed control while linking basic turns, and progressive practice runs. Goal: ski continuously while controlling direction." },
  { day: 5, title: "Traversing & Edge Control — Ski Control", description: "Traversing across the slope, uphill movement and side-stepping, basic edging and ski alignment, weight transfer, snow-plough turns on longer practice runs, and terrain awareness. Goal: develop stronger ski control." },
  { day: 6, title: "Turning Rhythm — Flow & Coordination", description: "Review of fundamental turns, then continuous turning with rhythm and body coordination, weight transfer and basic swing movement, managing speed on longer beginner runs. Goal: move from individual turns to fluid skiing." },
  { day: 7, title: "Terrain Confidence — Skiing Longer Runs", description: "Extended warm-up followed by longer downhill runs with continuous linked turns, traversing, speed control and basic terrain adaptation on instructor-guided confidence-building runs. Goal: become comfortable skiing continuously." },
  { day: 8, title: "Introduction to Parallel Skiing", description: "Moving beyond the snow-plough: parallel ski position and alignment, weight transfer, basic edging, parallel movement exercises and open parallel turns with controlled practice. Goal: understand the fundamentals of parallel skiing." },
  { day: 9, title: "Parallel Turns — Developing Efficiency", description: "Parallel stance, open then linked parallel turns, edge control and pole positioning, speed management and technique refinement on longer runs. Goal: more efficient and controlled turns." },
  { day: 10, title: "Lift & Mountain Skills — Expanding Your Terrain", description: "Ski-lift orientation with safe approach, loading and unloading, lift etiquette and slope awareness, then longer suitable runs with continuous skiing, speed management and terrain selection. Goal: comfortably access longer ski runs." },
  { day: 11, title: "Agility & Slalom — Direction, Rhythm & Control", description: "Parallel-turn revision, shorter turns and direction changes, basic pole use, slalom fundamentals with rhythm and timing, edge control and speed management in slalom practice. Goal: improve agility and directional control." },
  { day: 12, title: "Ski Skills Consolidation — Putting It All Together", description: "Snow-plough, linked and parallel turns, short and long turns, basic slalom, lift practice and longer runs, closing with independent skiing under supervision. Goal: consolidate the complete skill set." },
  { day: 13, title: "Ski Skills Assessment — Demonstrate Your Progress", description: "Participants demonstrate equipment handling, stance, balance, straight gliding, snow-plough, braking, traversing, turning, linked and parallel skiing, speed control, lift operation, terrain awareness and ski safety. Instructors provide individual feedback and recommendations for continued skiing." },
  { day: 14, title: "Free Skiing & Course Completion", description: "Final warm-up, guided practice runs and free skiing within individual ability, technique revision and group skiing, final photographs, course completion briefing, equipment return and check-out. Departure: Auli → Joshimath / Dehradun / Rishikesh." },
];

const SKI14_PREMIUM_ITINERARY: CourseItineraryDay[] = [
  { day: 1, title: "Premium Welcome & Personal Ski Assessment", description: "Everything in the Basic Day 1 programme, plus a personal introduction with your instructor, individual skiing goals, an initial skill assessment, a personal progression plan, and premium equipment fitting with individual adjustments." },
  { day: 2, title: "Ski Foundations + Personal Coaching", description: "The Basic foundations curriculum plus an individual balance assessment, personal stance correction, one-to-one instructor feedback and additional practice runs." },
  { day: 3, title: "Snow-Plough & Braking + Video Feedback", description: "The Basic curriculum plus individual speed-control coaching, technique correction and instructor-led progression drills. Video feedback: selected skiing footage is recorded for technical review." },
  { day: 4, title: "Fundamental Turns + Movement Analysis", description: "The Basic curriculum plus individual turn analysis, body-position correction, turn-initiation coaching and linking-turn drills. Movement-analysis review covering stance, balance, ski alignment and turn mechanics." },
  { day: 5, title: "Edge Control & Traversing + Guided Runs", description: "Advanced beginner edging drills, weight-transfer exercises, terrain-specific coaching and individual technique correction, closing with longer guided runs." },
  { day: 6, title: "Turn Rhythm & Basic Swing + Personal Coaching", description: "Advanced turn drills, rhythm development and body coordination, basic swing development with personal coaching throughout. Video feedback wherever useful." },
  { day: 7, title: "Longer Runs, Confidence & Progression Review", description: "Longer guided runs with continuous skiing, terrain adaptation and speed management under individual coaching, ending with a personal progression review against your Day 1 goals." },
  { day: 8, title: "Parallel Skiing + Technique Review", description: "Parallel stance and alignment, weight transfer, edge engagement and open parallel turns with individual coaching. Video technique review comparing your early-course and current skiing." },
  { day: 9, title: "Parallel Turn Development", description: "Linked parallel turns, turn rhythm, edge control and pole positioning, with short and long turn variations and individual technique refinement." },
  { day: 10, title: "Lift & Mountain Skills + Instructor-Led Runs", description: "Lift training, longer runs and mountain orientation with terrain selection and speed management on instructor-led runs, including individual corrections throughout." },
  { day: 11, title: "Slalom & Agility + Performance Review", description: "Short-turn development, pole use, slalom, rhythm, edge control, directional accuracy and speed management — followed by a performance review where your instructor identifies areas for improvement." },
  { day: 12, title: "Performance Consolidation + Mountain Skills Session", description: "Complete technique revision — parallel, short, long turns and slalom — with lift practice, longer runs and independent skiing under personal coaching. Mountain skills session: reading terrain, understanding snow conditions, cold-weather management, responsible skiing and basic emergency awareness." },
  { day: 13, title: "Premium Final Assessment + Personal Ski Report", description: "Individual assessment covering equipment handling, balance, stance, gliding, braking, snow-plough, turning, traversing, parallel skiing, short turns, slalom, speed control, lift operation, terrain awareness, safety and overall confidence — with final video analysis (strengths, improvements, body positioning, turn mechanics, next steps) and a personal written skiing report." },
  { day: 14, title: "Free Skiing & Premium Graduation", description: "Final warm-up, guided and free skiing with parallel turns, short/long turns and slalom practice, final instructor corrections and group photographs. Graduation: individual performance feedback, the Expedition Happiness Ski Course Certificate and personal next-level recommendations — closed out with an après-ski experience of tea, snacks, course memories and an optional bonfire, weather permitting. Departure: Auli → Joshimath / Dehradun / Rishikesh." },
];

export const courses: Course[] = [
  {
    id: 1,
    name: "7-Day Skiing Course",
    slug: "skiing-course",
    type: "Skiing",
    title: "Learn to Ski in the Himalayas",
    price: 10000,
    currency: "Rs.",
    duration: "7 Days",
    dates: "Dec 2026 — Mar 2027",
    location: "Auli, Uttarakhand",
    level: "All Levels",
    levelRequirement: "No prior experience needed. We start from the basics.",
    instructorRatio: "6:1 student-to-instructor ratio",
    weeklyHours: "20+ hours of practical training per week",
    description: "Whether you're a complete beginner or looking to refine your technique, our certified instructors guide you through a structured 7-day progression on the slopes of Auli — with the majestic Nanda Devi (7,816m) as your backdrop. Inspired by international snow school standards, you'll receive personalised coaching, HD video analysis, and a course completion certificate recognised across India's snow sports community.",
    shortDescription: "Master the slopes with certified instructors on Auli's pristine powder runs beneath Nanda Devi.",
    highlights: [
      "20+ hours of practical coaching per week from certified instructors",
      "Small group sizes (max 6:1) for personal attention",
      "HD video movement analysis of your technique",
      "Structured weekly progression with personalised evaluations",
      "Full Auli lift pass — cable car & chairlift access",
      "Off-snow seminars: mountain safety, equipment care, snow science",
      "Weekly social après sessions with fellow riders",
      "Course completion certificate",
    ],
    itinerary: [
      { day: 1, title: "Arrive Joshimath & Gear Up", description: "Transfer from Joshimath to Auli. Meet your instructors, get fitted for boots and skis by our equipment specialists, and settle into your mountain-view accommodation." },
      { day: 2, title: "First Turns on the Nursery Slopes", description: "Ride the Auli cable car up (one of the world's highest) and learn the fundamentals — stance, balance, snowplough, and how to stop with confidence. Afternoon: theory session on mountain safety and weather." },
      { day: 3, title: "Snowplough & Controlled Stops", description: "Build control on gentle gradients: snowplough turns, edging, and safe falling techniques. Afternoon: equipment tuning clinic — learn to maintain your own gear." },
      { day: 4, title: "Linking Your Turns", description: "Start linking turns down beginner blue runs. Your instructor films your technique for afternoon video analysis session — see exactly what to improve." },
      { day: 5, title: "Chairlift & Longer Descents", description: "Take the chairlift for longer runs across Auli's varied terrain. Refine your parallel turns and carry more speed across wider pistes. Afternoon: snow science seminar." },
      { day: 6, title: "Intermediate Slopes & Off-Piste Taster", description: "Progress to steeper runs and a guided taste of soft off-piste powder beneath Nanda Devi. End with a group challenge run and celebratory après." },
      { day: 7, title: "Assessment & Certification", description: "A final assessed run demonstrating your progression, personalised written evaluation from your Level 4 Pro, course certificate, and a celebratory send-off." },
    ],
    tiers: [
      {
        id: "basic",
        name: "Basic",
        blurb: "The complete beginner progression — core technique, lifts and independent skiing on Auli's nursery and green runs.",
        priceBase: 10000,
        priceFull: 20000,
        features: [
          "Certificate of completion + graduation ceremony",
          "Certified instructors · max 6 students per instructor",
          "3–4 hrs of practical coaching daily",
          "Equipment handling, stance, balance & straight gliding",
          "Safe falling & recovery techniques",
          "Snow-plough braking and basic turns",
          "Linked beginner turns with speed control",
          "Introduction to parallel skiing & basic edging",
          "Ski-lift operation & slope etiquette",
          "Independent practice on suitable beginner terrain",
        ],
        itinerary: [
          { day: 1, title: "Arrival & Ski Orientation", description: "Joshimath → Auli. Check-in and welcome briefing from the Expedition Happiness team, introductions and course overview. Equipment introduction (skis, boots, poles, helmet, goggles) with fitting and adjustment, a short acclimatisation walk around Auli, and an intro to slope rules and ski etiquette. Overnight in Auli. Training: orientation + basic theory." },
          { day: 2, title: "Skiing Fundamentals & Balance", description: "\"Getting comfortable on snow.\" Warm-up and mobility, walking with skis, side-stepping and climbing gentle slopes, basic stance and weight distribution, straight gliding on beginner terrain, safe falling and recovery, intro to speed control and the snow-plough position with controlled stopping on gentle slopes. Practical training: 3–4 hrs." },
          { day: 3, title: "Braking & Basic Turns", description: "Snow-plough braking and speed management, traversing across a gentle slope, first directional changes and basic snow-plough turns left and right — controlling speed through the turns with correct body position. Individual instructor corrections and practice throughout. Practical training: 3–4 hrs." },
          { day: 4, title: "Linked Turns & Slope Confidence", description: "Link consecutive snow-plough turns while maintaining controlled speed without stopping after every turn. Intro to the parallel-skiing position, weight transfer and basic edging, with instructor-guided runs on slightly more challenging beginner terrain matched to your ability. Practical training: 3–4 hrs." },
          { day: 5, title: "Ski Lift & Longer Slope Practice", description: "Introduction to ski-lift operation — approaching the lift, getting on and off safely — plus lift safety and slope etiquette. Then guided skiing on suitable longer runs: continuous linked turns, controlled braking, speed management and multiple practice runs with instructor guidance. Practical training: 3–4 hrs." },
          { day: 6, title: "Independent Practice", description: "\"Putting it all together.\" Supervised independent practice runs — snow-plough braking, linked turns, basic parallel-skiing practice, controlled stops and speed control on suitable beginner terrain, with individual instructor guidance where required. Practical training: 3–4 hrs." },
          { day: 7, title: "Final Ski Session & Course Completion", description: "Final warm-up and revision of key techniques, guided practice runs, basic lift practice and group photographs. Course wrap-up with general instructor feedback and guidance for continuing your skiing. Departure after breakfast towards Joshimath / Dehradun / Rishikesh." },
        ],
      },
      {
        id: "premium",
        name: "Premium",
        blurb: "More slope time plus HD video analysis, snow-science seminars, après-ski socials, a formal final assessment and a graduation ceremony.",
        priceBase: 15000,
        priceFull: 30000,
        features: [
          "Everything in Basic — certificate + graduation ceremony included",
          "4–5 hrs practical coaching daily (~25+ hrs total)",
          "HD video movement analysis sessions",
          "Evening seminars: mountain safety, snow science & equipment care",
          "Formal final assessment with personal evaluation",
          "Après-ski social session with optional bonfire",
          "Certified instructors · max 6 students per instructor",
        ],
        itinerary: [
          { day: 1, title: "Arrival, Orientation & Acclimatisation", description: "Joshimath → Auli. Check-in, welcome briefing, introductions and course overview with full safety briefing. Equipment briefing, fitting and adjustment, short acclimatisation walk around Auli. Evening session: mountain safety, weather and snow conditions, ski etiquette and basic terminology. Overnight in Auli. Training: orientation + theory." },
          { day: 2, title: "Skiing Fundamentals & Balance", description: "First practical session after breakfast: warm-up and mobility, walking and side-stepping with skis, basic stance, balance and weight distribution, straight gliding on beginner terrain, safe falling techniques, speed control, snow-plough position and controlled stops — with individual instructor feedback. Evening theory: equipment care, snow conditions and mountain weather. Training: 4–5 hrs." },
          { day: 3, title: "Braking, Snow-Plough & Basic Turns", description: "Snow-plough braking, speed management, traversing and linking left–right turns with correct body position — filmed for movement analysis. Evening HD video analysis session: instructors review footage covering body position, balance, ski alignment and turning technique, with areas to improve. Training: 4–5 hrs." },
          { day: 4, title: "Linked Turns & Slope Confidence", description: "Connect skills into continuous skiing: controlled traversing, linked turns without stopping, intro to parallel position, weight transfer and edging, on terrain matched to ability — plus instructor-led practice runs and personal technique evaluation. Evening seminar: mountain safety & snow science — reading slopes, cold-weather precautions and emergency response. Training: 4–5 hrs." },
          { day: 5, title: "Ski Lift, Longer Runs & Après-Ski", description: "Chairlift orientation — approaching, loading and unloading safely — then guided skiing on longer suitable runs: continuous linked turns, braking at designated points, terrain awareness and multiple corrected practice runs. Evening après-ski social: tea and snacks, group interaction, photos and videos, optional bonfire weather permitting. Training: 4–5 hrs." },
          { day: 6, title: "Independent Skiing & Final Assessment", description: "Independent practice runs within your ability — refining snow-plough and linked turns, parallel fundamentals, controlled stops and slope awareness — followed by the final assessed run covering equipment handling, stance, gliding, braking, directional control, speed management, lift usage and overall confidence. Evening: individual feedback and next-level guidance. Training: 4–5 hrs." },
          { day: 7, title: "Final Ski Session & Graduation Ceremony", description: "A fun final morning of guided practice runs where you demonstrate everything learned, with group photos and videos — then the Graduation Ceremony: individual performance feedback and the Expedition Happiness Ski Course Certificate. Departure after breakfast towards Joshimath / Dehradun / Rishikesh." },
        ],
      },
    ],
    inclusions: [
      { icon: "structor", label: "Certified Instructor", description: "20+ hrs/week from Level 4 qualified coaches" },
      { icon: "equipment", label: "All Equipment", description: "Skis, boots, helmets & poles fitted by specialists" },
      { icon: "lift", label: "Lift Passes", description: "Full Auli cable car & chairlift access" },
      { icon: "bed", label: "Accommodation", description: "7 nights in Auli mountain-view stay" },
      { icon: "food", label: "All Meals", description: "Breakfast, lunch & dinner included daily" },
      { icon: "certificate", label: "Certification", description: "Course completion certificate + personalised evaluation" },
      { icon: "firstaid", label: "Safety Support", description: "Emergency first aid & mountain rescue protocol" },
      { icon: "photos", label: "HD Video Analysis", description: "Movement analysis + professional course photos" },
    ],
    testimonials: [
      { name: "Priya M.", location: "Mumbai", text: "Best week of my life! The instructors were patient and I went from zero to linking turns in 5 days. The video analysis sessions were a game-changer — you can see exactly what to fix. Nanda Devi views are unreal.", rating: 5 },
      { name: "Arjun K.", location: "Delhi", text: "Professional setup, great gear, and the guides know every inch of these mountains. The small group size meant I got real attention. Highly recommend for beginners.", rating: 5 },
      { name: "Sneha R.", location: "Bangalore", text: "The Auli cable car ride alone is worth the trip. But the structured progression and the après sessions with other riders made it special. Already booked for next season!", rating: 5 },
    ],
    image: "/assets/skiing/IMG_5035.JPG.jpeg",
    gallery: [
      ...SKIING_LOCAL_GALLERY,
      ...SKIING_LOCAL_VIDEOS,
    ],
    video: "/assets/skiing/IMG_5025.MOV",
  },
  {
    id: 6,
    name: "14-Day International-Style Skiing Course",
    slug: "skiing-intensive-2week",
    type: "Skiing",
    title: "Ski Auli the International Way",
    price: 18500,
    currency: "Rs.",
    duration: "14 Days",
    dates: "Dec 2026 — Mar 2027",
    location: "Auli, Uttarakhand, India",
    level: "Beginner → Basic Intermediate",
    levelRequirement: "No prior experience needed. Open to complete beginners.",
    instructorRatio: "Maximum 6 students per instructor (smaller on Premium)",
    weeklyHours: "International-style progressive ski instruction",
    description: "A 14-day international-style progressive ski course on the slopes of Auli. Move from your first glide to confident parallel turns and slalom across a structured fortnight — balance and foundations, snow-plough control, fundamental turns, edge work, rhythm, lift skills and agility — closing with a formal skills assessment and free-skiing finale. Choose the Basic program, or go Premium for personal progression plans, HD video feedback, individual coaching and a personal skiing report.",
    shortDescription: "14 days of international-style progressive ski instruction — from first glide to parallel turns, with an optional Premium one-to-one track.",
    highlights: [
      "International-style progressive syllabus across 14 days / 13 nights",
      "Full arc: gliding → snow-plough → linked turns → parallel → slalom",
      "Lift & mountain-skills day to unlock Auli's longer runs",
      "Day-13 skills assessment with individual instructor feedback",
      "Premium track: personal progression plan + HD video feedback",
      "Premium track: final video analysis & personal skiing report",
      "Certificate of completion for every participant",
      "Best season Dec–Mar, subject to snow conditions",
    ],
    itinerary: SKI14_BASIC_ITINERARY,
    tiers: [
      {
        id: "basic",
        name: "Basic",
        blurb: "The complete international-style progression over two weeks — gliding to parallel turns and slalom, capped by a formal skills assessment.",
        priceBase: 18500,
        priceFull: 38000,
        features: [
          "14-day international-style progression: glide → snow-plough → parallel → slalom",
          "Certified instructors · maximum 6 students per instructor",
          "Lift & mountain-skills training included",
          "Day-13 skills assessment with individual feedback",
          "Certificate of completion",
          "Free-skiing finale within your ability",
        ],
        itinerary: SKI14_BASIC_ITINERARY,
      },
      {
        id: "premium",
        name: "Premium",
        blurb: "Same proven syllabus, delivered like a private academy — personal progression plans, HD video reviews, daily one-to-one coaching and a final analysis report.",
        priceBase: 23500,
        priceFull: 45500,
        features: [
          "Everything in Basic — same international syllabus",
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
      { icon: "structor", label: "Certified Instructor", description: "International-style progressive coaching, certified" },
      { icon: "equipment", label: "All Equipment", description: "Skis, boots, helmets & poles fitted by specialists" },
      { icon: "lift", label: "Lift Passes", description: "Full 14-day Auli cable car & chairlift access" },
      { icon: "bed", label: "Accommodation", description: "13 nights in Auli accommodation (with-stay packages)" },
      { icon: "food", label: "All Meals", description: "Breakfast, lunch & dinner included daily (with-stay packages)" },
      { icon: "certificate", label: "Certification", description: "Course completion certificate + personal feedback" },
      { icon: "firstaid", label: "Safety Support", description: "Emergency first aid & mountain rescue protocol" },
      { icon: "photos", label: "HD Video Analysis", description: "Regular movement analysis + professional course photos" },
    ],
    testimonials: [
      { name: "Rohan M.", location: "Delhi", text: "Two weeks took me from never wearing skis to parallel turns on blue runs. The progression was perfectly paced and the video sessions made improvement obvious.", rating: 5 },
      { name: "Ishita S.", location: "Mumbai", text: "Worth every rupee. Small groups meant constant feedback, and by week two we were riding lifts and doing proper longer descents. Already signed up for next season.", rating: 5 },
      { name: "Karan V.", location: "Chandigarh", text: "This is a proper snow school, not a holiday camp. Structured days, theory seminars, real assessment at the end. My skiing transformed.", rating: 5 },
    ],
    image: "/assets/skiing/IMG_5036.JPG.jpeg",
    gallery: [
      ...SKIING_LOCAL_GALLERY,
      ...SKIING_LOCAL_VIDEOS,
    ],
    video: "/assets/skiing/IMG_5025.MOV",
  },
  {
    id: 2,
    name: "7-Day Snowboarding Course",
    slug: "snowboarding-course",
    type: "Snowboarding",
    title: "Snowboard the Himalayan Powder",
    price: 35000,
    currency: "Rs.",
    duration: "7 Days",
    dates: "Dec 2026 — Mar 2027",
    location: "Auli, Uttarakhand",
    level: "All Levels",
    levelRequirement: "No prior experience needed. Must be comfortable on snow (skiing or boarding) for intermediate+ courses.",
    instructorRatio: "6:1 student-to-instructor ratio",
    weeklyHours: "20+ hours of practical training per week",
    description: "Learn to snowboard on Auli's legendary powder with certified instructors. From your first heel-side turns to carving down intermediate runs, all beneath the gaze of Nanda Devi. Our structured programme follows international snow school standards — 20+ hours of coaching weekly, HD video analysis, theory seminars on mountain safety, and a personalised evaluation from your Level 4 Pro.",
    shortDescription: "Carve through Himalayan powder on a board — certified instruction from first turns to confident riding.",
    highlights: [
      "20+ hours of practical coaching per week from certified instructors",
      "Small group sizes (max 6:1) for personal attention",
      "HD video movement analysis — see your progression",
      "Weekly personalised evaluations from Level 4 Pros",
      "Theory seminars: mountain safety, equipment tuning, snow science",
      "Weekly social après with fellow riders",
      "Full Auli lift pass — cable car & chairlift access",
      "Course completion certificate",
    ],
    itinerary: [
      { day: 1, title: "Arrival & Snowboard Orientation", description: "Arrival and accommodation check-in. Introduction to the instructor and course, snowboard equipment fitting, understanding snowboard, bindings and boots, safety briefing and mountain etiquette. Warm-up and mobility session, basic stance identification, introduction to balancing on the board and practice on flat snow. Focus: getting comfortable with the equipment and snowboard." },
      { day: 2, title: "Balance, Stance & Basic Movement", description: "Warm-up and mobility, correct riding stance, falling and getting back up safely, skate technique, straight glide, heel-edge control, toe-edge introduction, speed control and basic stopping techniques. Focus: learning to control the snowboard rather than simply sliding." },
      { day: 3, title: "Edge Control & Turning", description: "Revision of basic techniques, heel-side and toe-side traversing, edge engagement, speed management, introduction to linked turns, basic J-turns, C-turn progression and controlled riding on beginner terrain. Focus: developing confident turns and edge control." },
      { day: 4, title: "Linked Turns & Mountain Riding", description: "Warm-up and technical drills, linking heel-side and toe-side turns, controlling speed through turns, riding different sections of the slope, line selection, introduction to riding steeper terrain and individual correction by instructor. Focus: becoming a controlled and independent rider." },
      { day: 5, title: "Intermediate Riding Skills", description: "Dynamic turning, improving posture and balance, carving fundamentals, riding variable snow conditions, terrain awareness, lift/tow awareness and mountain etiquette, and introduction to basic freeride concepts, conditions permitting. Focus: improving technique and confidence." },
      { day: 6, title: "Freeride & Advanced Fundamentals", description: "Technical warm-up, edge-control drills, carving progression, introduction to freeride technique, terrain selection, riding natural features safely, individual coaching, and video analysis/session review where conditions and equipment permit. Focus: applying technique in real mountain conditions." },
      { day: 7, title: "Final Riding Day & Assessment", description: "Warm-up, technical revision, individual riding assessment, demonstration of linked turns, edge control and stopping, controlled descent, instructor feedback and course completion assessment. Certificate of participation/completion from Expedition Happiness Treks. Focus: demonstrating what you have learned and understanding your next progression." },
    ],
    inclusions: [
      { icon: "structor", label: "Certified Instructor", description: "20+ hrs/week from Level 4 qualified coaches" },
      { icon: "equipment", label: "All Equipment", description: "Boards, boots, helmets & bindings fitted by specialists" },
      { icon: "lift", label: "Lift Passes", description: "Full Auli cable car & chairlift access" },
      { icon: "bed", label: "Accommodation", description: "7 nights in Auli mountain-view stay" },
      { icon: "food", label: "All Meals", description: "Breakfast, lunch & dinner included daily" },
      { icon: "certificate", label: "Certification", description: "Course completion certificate + personalised evaluation" },
      { icon: "firstaid", label: "Safety Support", description: "Emergency first aid & mountain rescue protocol" },
      { icon: "photos", label: "HD Video Analysis", description: "Movement analysis + professional course photos" },
    ],
    testimonials: [
      { name: "Vikram S.", location: "Pune", text: "The snowboarding course was incredible. Went from never touching a board to confidently linking turns in 7 days. The video analysis was a game-changer — I could see my stance improving daily. World-class instructors.", rating: 5 },
      { name: "Meera J.", location: "Chennai", text: "Auli's powder is something else! The 20+ hours of coaching meant I improved every single day. The après sessions with other riders were a highlight. Best investment in a new skill.", rating: 5 },
      { name: "Rahul P.", location: "Delhi", text: "The structured progression from nursery slopes to intermediate runs was exactly what I needed. The small group size meant real personal attention. Professional setup all the way.", rating: 5 },
    ],
    image: "/assets/snowboarding/IMG_5472.jpg",
    video: "/assets/snowboarding/IMG_5201.MOV",
    gallery: [
      "/assets/snowboarding/IMG_5472.jpg",
      "/assets/snowboarding/IMG_4063.jpg",
      "/assets/snowboarding/IMG_5455.jpeg",
      "/assets/snowboarding/IMG_5201.MOV",
      "/assets/snowboarding/IMG_0942.MOV",
    ],
    featured: true,
  },
  {
    id: 4,
    name: "2-Week Snowboard Intensive",
    slug: "snowboard-intensive-2week",
    type: "Snowboarding",
    title: "2-Week Snowboard Intensive — Auli",
    price: 60000,
    currency: "Rs.",
    duration: "14 Days",
    dates: "Dec 2026 — Feb 2027",
    location: "Auli, Uttarakhand",
    level: "Beginner to Intermediate",
    levelRequirement: "No prior experience needed. Open to complete beginners.",
    instructorRatio: "5:1 student-to-instructor ratio",
    weeklyHours: "25+ hours of practical training per week",
    description: "Our flagship 2-week snowboard programme — double the time, double the progression. Go from absolute beginner to confidently carving intermediate blue runs in 14 days of structured training. With 25+ hours of coaching weekly, daily video analysis, theory seminars on mountain safety and avalanche awareness, and a final assessment that mirrors international instructor certification standards.",
    shortDescription: "14 days of intensive snowboard training — from first turns to carving intermediate runs with confidence.",
    highlights: [
      "25+ hours of practical coaching per week — the most training per day of any Indian snow school",
      "Small group sizes (max 5:1) for intensive personal attention",
      "Daily HD video analysis with personalised feedback",
      "Theory seminars: mountain safety, avalanche awareness, weather, equipment",
      "Progressive terrain: nursery → blue → intermediate red runs",
      "Off-snow fitness sessions designed for boarders",
      "Weekly social après with the group",
      "Final assessment + certificate of competency",
    ],
    itinerary: [
      { day: 1, title: "Arrive & Orientation", description: "Transfer to Auli. Equipment fitting, resort orientation, meet your instructors. Evening: welcome dinner and course overview." },
      { day: 2, title: "Stance & Balance", description: "Nursery slopes: board stance, heel-side edge, falling safely. Afternoon: theory — mountain safety & weather." },
      { day: 3, title: "Heel-Side Turns", description: "Linking heel-side turns on gentle terrain. Video analysis of stance and body position." },
      { day: 4, title: "Toe-Side Introduction", description: "First toe-side attempts on the magic carpet area. Equipment tuning clinic." },
      { day: 5, title: "Toe-Side Turns", description: "Build control on toe-side turns and edge transitions. Afternoon: snow science seminar." },
      { day: 6, title: "Linking Turns", description: "Link heel-to-toe turns on blue runs. Video review of progression." },
      { day: 7, title: "Speed Control & Carving", description: "Refine linked turns, introduce carving technique. Off-snow fitness session." },
      { day: 8, title: "Rest Day / Free Riding", description: "Explore Auli at your own pace. Optional group ride with instructor." },
      { day: 9, title: "Chairlift & Longer Runs", description: "Chairlift access for longer descents. Focus on consistent linked turns across varied terrain." },
      { day: 10, title: "Intermediate Terrain", description: "Progress to steeper blue and easy red runs. Afternoon: avalanche awareness seminar." },
      { day: 11, title: "Carving & Edge Work", description: "Advanced carving drills — heel-side and toe-side carves on groomed terrain." },
      { day: 12, title: "Freestyle Introduction", description: "Terrain park session: ollies, 180s, small boxes. Afternoon: video analysis of freestyle." },
      { day: 13, title: "Final Assessment", description: "Assessed run on intermediate terrain. Personalised written evaluation from your Level 4 Pro." },
      { day: 14, title: "Certification & Departure", description: "Course certificate ceremony, celebratory après, and departure." },
    ],
    inclusions: [
      { icon: "structor", label: "Certified Instructor", description: "25+ hrs/week from Level 4 qualified coaches" },
      { icon: "equipment", label: "All Equipment", description: "Boards, boots, helmets & bindings fitted by specialists" },
      { icon: "lift", label: "Lift Passes", description: "Full 14-day Auli cable car & chairlift access" },
      { icon: "bed", label: "Accommodation", description: "14 nights in Auli mountain-view stay" },
      { icon: "food", label: "All Meals", description: "Breakfast, lunch & dinner included daily" },
      { icon: "certificate", label: "Certification", description: "Certificate of competency + personalised evaluation" },
      { icon: "firstaid", label: "Safety Support", description: "Emergency first aid & mountain rescue protocol" },
      { icon: "photos", label: "HD Video Analysis", description: "Daily movement analysis + professional course photos" },
    ],
    testimonials: [
      { name: "Kavya N.", location: "Hyderabad", text: "The 2-week intensive was transformative. Day 1 I couldn't stand on the board, day 13 I was carving down intermediate runs. The daily video feedback was incredible — you see yourself improving in real time.", rating: 5 },
      { name: "Rohan D.", location: "Mumbai", text: "This is the real deal. 25+ hours a week of coaching, small groups, theory sessions — it's like a proper snow school, not a holiday course. The avalanche awareness seminar was eye-opening.", rating: 5 },
      { name: "Ananya S.", location: "Delhi", text: "Best two weeks of my life. The instructors pushed me just enough, the après sessions were amazing, and I left with a proper skill. Already planning my return for the advanced course.", rating: 5 },
    ],
    image: "/assets/snowboarding/IMG_4063.jpg",
    video: "/assets/snowboarding/IMG_4222.MOV",
    gallery: [
      "/assets/snowboarding/IMG_4063.jpg",
      "/assets/snowboarding/IMG_5455.jpeg",
      "/assets/snowboarding/IMG_5472.jpg",
      "/assets/snowboarding/IMG_4222.MOV",
      "/assets/snowboarding/IMG_3983.MOV",
      "/assets/snowboarding/IMG_5220.MOV",
      "/assets/snowboarding/IMG_5272.MOV",
    ],
  },
  {
    id: 3,
    name: "Backcountry Ski & Snowboard Touring",
    slug: "backcountry-skiing",
    type: "Backcountry",
    title: "Backcountry Ski & Snowboard Touring Adventure",
    price: 45000,
    currency: "Rs.",
    duration: "7 Days",
    dates: "Jan — Mar 2027",
    location: "Auli, Uttarakhand",
    level: "Intermediate+",
    levelRequirement: "Must link parallel turns on red runs. Some off-piste experience recommended.",
    instructorRatio: "4:1 guide-to-client ratio",
    weeklyHours: "Full-day guided sessions",
    description: "For experienced skiers ready to explore beyond the resort. Tour through untouched Himalayan terrain, learn avalanche safety, and experience the freedom of backcountry skiing beneath Nanda Devi.",
    shortDescription: "Explore untouched Himalayan terrain with expert guides — avalanche safety, touring techniques, and wild powder.",
    highlights: [
      "4:1 guide-to-client ratio for maximum safety",
      "Certified avalanche guide with 15+ years Himalayan experience",
      "AST 1 avalanche safety certification included",
      "Tour through pristine backcountry beneath Nanda Devi",
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
      { day: 6, title: "Extended Tour & Descent", description: "Full-day touring expedition with multiple descents through varied terrain." },
      { day: 7, title: "Final Run & Departure", description: "A morning backcountry run, course debrief, and celebratory lunch before departure." },
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
    testimonials: [
      { name: "Aditya K.", location: "Bangalore", text: "The backcountry touring was life-changing. Skiing untracked powder with Nanda Devi towering above — nothing compares.", rating: 5 },
      { name: "Zara M.", location: "Mumbai", text: "The avalanche safety training alone was worth the price. Professional, thorough, and empowering.", rating: 5 },
      { name: "Karthik L.", location: "Delhi", text: "For anyone who can already ski and wants the next step — this is it. The guides are world-class.", rating: 5 },
    ],
    image: "/assets/backcountry%20touring/IMG_0711.jpeg",
    video: "/assets/backcountry%20touring/IMG_0670.mov",
    gallery: [
      "/assets/backcountry%20touring/IMG_0711.jpeg",
      "/assets/backcountry%20touring/IMG_1615.jpeg",
      "/assets/backcountry%20touring/IMG_3991.jpeg",
      "/assets/backcountry%20touring/IMG_5467.jpeg",
      "/assets/backcountry%20touring/IMG_5455.jpg",
      "/assets/backcountry%20touring/IMG_0670.mov",
      "/assets/backcountry%20touring/IMG_0702.mov",
      "/assets/backcountry%20touring/IMG_0705.mov",
      "/assets/backcountry%20touring/IMG_1330.mov",
      "/assets/backcountry%20touring/IMG_1398.mov",
      "/assets/backcountry%20touring/IMG_1474.mov",
      "/assets/backcountry%20touring/IMG_2170.mov",
      "/assets/backcountry%20touring/IMG_3385.mov",
    ],
  },
];
