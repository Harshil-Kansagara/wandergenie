import { db } from "./firebase.js";

const personas = [
  {
    id: "thrill-seeker",
    name: "Thrill Seeker",
    tagline: "Your quest for adrenaline starts here.",
    description:
      "For the traveler who lives for adventure, challenge, and the rush of the great outdoors. The Thrill-Seeker's itinerary is packed with high-energy activities like trekking, extreme sports, and unique, pulse-pounding experiences.",
    icon_url: "https://img.icons8.com/ios/50/000000/trekking.png",
    introduction:
      "Your adventure awaits! Brace yourself for a heart-pounding journey through a land of daring feats and breathtaking views. This itinerary is your quest map, designed to push your limits and fill your soul with adrenaline. ",
    conclusion:
      "Quest completed! You’ve conquered new heights, braved the wild, and gathered stories that will last a lifetime. Where will your next adventure take you?",
    available_modules: [
      "module-arrival-and-acclimatize",
      "module-mountain-conqueror",
      "module-water-warrior",
      "module-winter-zenith",
      "module-departure-and-reflection",
      "module-urban-daredevil",
      "module-local-connection",
      "module-monsoon-maverick",
      "module-summit-conqueror",
    ],
  },
  {
    id: "urban-explorer",
    name: "Urban Explorer",
    tagline: "Discovering the city's hidden pulse.",
    description:
      "This traveler loves bustling city life, street art, hidden bars, and local markets. The Urban Explorer's itinerary is designed to find the city's true character, moving beyond tourist traps to discover where the locals go.",
    icon_url: "https://img.icons8.com/ios/50/000000/city-buildings.png",
    introduction:
      "The urban landscape is your new frontier. Put on your walking shoes and prepare to peel back the layers of the city. Your quest is to find the stories that lie just beyond the main streets. ",
    conclusion:
      "Quest completed! You didn't just see the city; you felt its pulse, uncovered its secrets, and left with a thousand stories. Where will your next exploration take you?",
    available_modules: [
      "module-arrival-and-acclimatize",
      "module-urban-pulse-finder",
      "module-gastronomic-quest",
      "module-street-art-crusade",
      "module-urban-by-night",
      "module-local-connection",
      "module-departure-and-reflection",
    ],
  },
  {
    id: "cultural-crusader",
    name: "Cultural Crusader",
    tagline: "A journey through time and tradition.",
    description:
      "For the history buff and art lover. The Cultural Crusader's trip is a deep dive into heritage, focusing on museums, ancient ruins, historical sites, and cultural festivals. It's a journey of learning and appreciation.",
    icon_url: "https://img.icons8.com/ios/50/000000/museum.png",
    introduction:
      "Every monument holds a memory, and every street a story. Your mission is to travel back in time, connect with living traditions, and become part of a new culture. This is your quest for authenticity. ",
    conclusion:
      "Quest completed! You didn’t just see the past; you lived it. You gathered stories that will last a lifetime, leaving a small piece of your heart in a culture that now feels like your own. Where will your next journey into history take you?",
    available_modules: [
      "module-arrival-and-acclimatize",
      "module-ancient-history-quest",
      "module-spiritual-journey",
      "module-art-and-craft-mastery",
      "module-culinary-traditions",
      "module-local-connection",
      "module-departure-and-reflection",
    ],
  },
  {
    id: "zen-seeker",
    name: "Zen Seeker",
    tagline: "Find your calm in a world of chaos.",
    description:
      "The traveler who wants to disconnect and relax. The Zen Seeker's itinerary is about rejuvenation, focusing on tranquil beaches, quiet yoga retreats, and secluded spots. It's a trip for the mind, body, and soul.",
    icon_url: "https://img.icons8.com/ios/50/000000/lotus.png",
    introduction:
      "This is a journey to quiet the mind and listen to your soul. Your quest is not to conquer, but to connect. Embrace the stillness, breathe in the beauty, and find your calm in a world of motion. ",
    conclusion:
      "Quest completed! You’ve found your rhythm, calmed your spirit, and rediscovered a sense of peace. This journey ends, but the stillness you found will stay with you. Where will your inner compass lead you next?",
    available_modules: [
      "module-arrival-and-acclimatize",
      "module-inner-peace-retreat",
      "module-nature-therapy",
      "module-mindful-movement",
      "module-culinary-serenity",
      "module-departure-and-reflection",
    ],
  },
  {
    id: "gastronomic-guru",
    name: "Gastronomic Guru",
    tagline: "A delicious journey for the senses.",
    description:
      "For this traveler, the destination is all about the food. The Gastronomic Guru's itinerary is a delicious journey through local cuisine, from street food stalls to fine dining, and includes unique culinary experiences like cooking classes and food tours.",
    icon_url: "https://img.icons8.com/ios/50/000000/food-and-wine.png",
    introduction:
      "Welcome, culinary adventurer! Your passport has just been stamped, and your taste buds are the compass. Get ready to explore a world of flavors, from sizzling street food to exquisite fine dining. ",
    conclusion:
      "The last bite has been taken, but the flavors and memories will last a lifetime. You didn’t just eat the food; you experienced the culture. Where will your culinary quest take you next?",
    available_modules: [
      "module-arrival-and-acclimatize",
      "module-street-food-safari",
      "module-fine-dining-explorer",
      "module-culinary-masterclass",
      "module-local-produce-market",
      "module-departure-and-reflection",
    ],
  },
];

const quizQuestions = [
  {
    id: "q1",
    question_text: "What does your ideal vacation day look like?",
    options: [
      {
        option_text:
          "The Early Riser. Watching the sunrise from a mountain top.",
        image_url:
          "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=500&q=80",
        persona_scores: {
          "thrill-seeker": 3,
          "zen-seeker": 2,
        },
      },
      {
        option_text: "The Urbanite. Exploring a bustling city street market.",
        image_url:
          "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=500&q=80",
        persona_scores: {
          "urban-explorer": 3,
          "gastronomic-guru": 2,
        },
      },
      {
        option_text: "The Historian. In front of an ancient monument.",
        image_url:
          "https://images.unsplash.com/photo-1504215680853-026ed2a45def?w=500&q=80",
        persona_scores: {
          "cultural-crusader": 3,
        },
      },
    ],
  },
  {
    id: "q2",
    question_text: "What is your favorite souvenir to bring back from a trip?",
    options: [
      {
        option_text: "A New Skill.",
        image_url:
          "https://images.unsplash.com/photo-1528901166007-3784c7dd3653?w=500&q=80",
        persona_scores: {
          "gastronomic-guru": 3,
          "cultural-crusader": 2,
        },
      },
      {
        option_text: "A Postcard-Perfect Photo.",
        image_url:
          "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=500&q=80",
        persona_scores: {
          "urban-explorer": 2,
        },
      },
      {
        option_text: "A Story you can't wait to tell.",
        image_url:
          "https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=500&q=80",
        persona_scores: {
          "thrill-seeker": 3,
          "urban-explorer": 2,
        },
      },
    ],
  },
  {
    id: "q3",
    question_text: "How do you define 'getting lost'?",
    options: [
      {
        option_text: "A New Adventure.",
        image_url:
          "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=500&q=80",
        persona_scores: {
          "thrill-seeker": 3,
          "urban-explorer": 3,
        },
      },
      {
        option_text: "A Chance to Discover.",
        image_url:
          "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=500&q=80",
        persona_scores: {
          "urban-explorer": 2,
          "cultural-crusader": 2,
        },
      },
      {
        option_text: "A Good Time to Rest.",
        image_url:
          "https://images.unsplash.com/photo-1440778303588-435521a205bc?w=500&q=80",
        persona_scores: {
          "zen-seeker": 3,
        },
      },
    ],
  },
];

const itineraryModules = [
  {
    id: "module-arrival-and-acclimatize",
    name: "Arrival & Acclimatize",
    narrative:
      "Your epic journey begins! Before you conquer the destination, you need to master your surroundings. Today is about settling in, embracing the local vibe, and prepping your mind and body for the adventure ahead. ",
    activities: [
      {
        type: "morning",
        prompt_text:
          "Suggest a morning activity focused on reaching the destination and settling into accommodation. Emphasize a smooth, stress-free start.",
        keywords: ["travel", "check-in", "acclimatize", "local transport"],
      },
      {
        type: "afternoon",
        prompt_text:
          "Suggest a light, exploratory activity that helps the traveler get a feel for the area without being too physically taxing. Something to build anticipation.",
        keywords: ["exploratory walk", "light hike", "local exploration"],
      },
      {
        type: "evening",
        prompt_text:
          "Suggest a calm but engaging dinner spot to relax and refuel for the days ahead. A place with local flavor and a good atmosphere.",
        keywords: ["local restaurant", "calm dinner", "preparation"],
      },
    ],
    applicable_seasons: ["all"],
  },
  {
    id: "module-mountain-conqueror",
    name: "Mountain Conqueror",
    narrative:
      "Today, you'll feel the rhythm of the mountain and test your endurance. The ascent is your challenge, and the view from the top is your reward. ",
    activities: [
      {
        type: "morning",
        prompt_text:
          "Suggest a morning high-altitude trek or rock climbing spot. The goal is a physically demanding activity that offers a stunning payoff.",
        keywords: ["trekking", "rock climbing", "mountain biking"],
      },
      {
        type: "afternoon",
        prompt_text:
          "Suggest a physically challenging but rewarding activity, such as exploring a mountain pass or a technical hiking trail.",
        keywords: ["pass crossing", "hiking", "challenging trails"],
      },
      {
        type: "evening",
        prompt_text:
          "Suggest a vibrant spot with a high-energy vibe, like a traveler’s cafe or a lively bonfire, to share adventure stories and recharge.",
        keywords: ["travelers cafe", "bonfire", "storytelling"],
      },
    ],
    applicable_seasons: ["spring", "summer", "autumn"],
  },
  {
    id: "module-water-warrior",
    name: "Water Warrior",
    narrative:
      "It's time to brave the churning waters! Today’s quest is a test of courage and skill against the untamed power of rivers and rapids. ",
    activities: [
      {
        type: "morning",
        prompt_text:
          "Suggest a high-adrenaline water sport, such as white-water rafting or kayaking in challenging rapids.",
        keywords: ["rafting", "kayaking", "canyoning"],
      },
      {
        type: "afternoon",
        prompt_text:
          "Suggest a more technical water-based activity, like cliff jumping or a short, challenging river crossing.",
        keywords: ["cliff jumping", "river crossing"],
      },
      {
        type: "evening",
        prompt_text:
          "Suggest a relaxing riverside spot or a lively beachside shack to wind down and share the day’s conquests.",
        keywords: ["riverside dining", "beach shack", "sunset spot"],
      },
    ],
    applicable_seasons: ["summer", "monsoon", "autumn"],
  },
  {
    id: "module-winter-zenith",
    name: "Winter Zenith",
    narrative:
      "The mountains are cloaked in a blanket of white, but your spirit burns bright. This is a quest for those who live for the thrill of the cold. ",
    activities: [
      {
        type: "morning",
        prompt_text:
          "Suggest an exhilarating snow-based activity like heli-skiing, snowboarding, or a challenging ice-climbing session.",
        keywords: ["skiing", "snowboarding", "ice climbing"],
      },
      {
        type: "afternoon",
        prompt_text:
          "Suggest a demanding winter trek, like a frozen river trek (e.g., Chadar Trek) or an exploration of a high-altitude pass.",
        keywords: ["ice trekking", "winter hiking", "snowshoeing"],
      },
      {
        type: "evening",
        prompt_text:
          "Suggest a cozy, rustic lodge with a fireplace and warm drinks to relax and share stories of conquering the elements.",
        keywords: ["cozy lodge", "fireplace", "warm drinks"],
      },
    ],
    applicable_seasons: ["winter"],
  },
  {
    id: "module-departure-and-reflection",
    name: "Departure & Reflection",
    narrative:
      "Your quest has come to an end, but the memories will last a lifetime. Today is for a final moment of reflection and a smooth departure, already dreaming of your next great adventure. ",
    activities: [
      {
        type: "morning",
        prompt_text:
          "Suggest a final, easy-going activity like a sunrise viewpoint or a short stroll to soak in the last moments of the trip.",
        keywords: ["sunrise view", "stroll", "reflection"],
      },
      {
        type: "afternoon",
        prompt_text:
          "Provide information about a convenient departure from the destination. The focus is on a smooth and hassle-free exit.",
        keywords: ["departure", "airport", "train station"],
      },
    ],
    applicable_seasons: ["all"],
  },
  {
    id: "module-urban-daredevil",
    name: "Urban Daredevil",
    narrative:
      "The city is not a place to rest, but a new frontier to conquer. Today, you'll turn concrete and steel into your personal gym, finding adrenaline in the most unexpected corners of the urban jungle. ",
    activities: [
      {
        type: "morning",
        prompt_text:
          "Suggest a high-energy urban challenge, such as a parkour workshop, indoor rock climbing, or a race through city streets using unique transport.",
        keywords: [
          "parkour",
          "urban climbing",
          "city challenge",
          "scooter tour",
        ],
      },
      {
        type: "afternoon",
        prompt_text:
          "Suggest an exploratory activity that involves navigating the city in a new way. Think scavenger hunts, geocaching, or a challenging bike tour on a less-traveled route.",
        keywords: ["scavenger hunt", "geocaching", "urban biking"],
      },
      {
        type: "evening",
        prompt_text:
          "Suggest a vibrant, high-altitude spot, like a rooftop bar or a skyscraper observation deck, to witness the city lights and feel a sense of accomplishment.",
        keywords: ["rooftop bar", "observation deck", "city views"],
      },
    ],
    applicable_seasons: ["all"],
  },
  {
    id: "module-local-connection",
    name: "Local Connection",
    narrative:
      "True adventure lies in the stories of the people who call this land home. Today, you will connect with the locals and share their way of life, finding a new kind of thrill in authentic experiences. ",
    activities: [
      {
        type: "morning",
        prompt_text:
          "Suggest a hands-on, adventurous activity with a local. This could be learning a traditional martial art, joining a fishing expedition, or participating in a local sport.",
        keywords: [
          "local workshop",
          "martial arts",
          "fishing",
          "traditional sports",
        ],
      },
      {
        type: "afternoon",
        prompt_text:
          "Suggest an activity focused on local exploration, such as a guided tour of a remote village or a hike to a secret spot known only to the locals.",
        keywords: ["guided tour", "village exploration", "hidden gems"],
      },
      {
        type: "evening",
        prompt_text:
          "Suggest a home-cooked meal with a local family or a small community gathering to share travel stories and cultural insights.",
        keywords: ["home-cooked meal", "cultural exchange", "local community"],
      },
    ],
    applicable_seasons: ["all"],
  },
  {
    id: "module-monsoon-maverick",
    name: "Monsoon Maverick",
    narrative:
      "The heavens have opened, and the land pulses with raw, untamed energy. You are a true maverick, ready to conquer the wild in its most powerful state, where every drop of rain adds to the thrill. ",
    activities: [
      {
        type: "morning",
        prompt_text:
          "Suggest a water-based adventure that is at its peak during the monsoon, such as high-grade white-water rafting, or canyoning in a swollen river.",
        keywords: ["monsoon rafting", "canyoning", "waterfall trekking"],
      },
      {
        type: "afternoon",
        prompt_text:
          "Suggest a hike or trek through a misty, rain-soaked forest, emphasizing the unique challenge and beauty of the wet season.",
        keywords: ["monsoon trek", "misty hiking", "rainy trails"],
      },
      {
        type: "evening",
        prompt_text:
          "Suggest a cozy spot with a view of the rain-drenched landscape, like a rustic cafe or a cabin with a fireplace, to relax after the day’s conquests.",
        keywords: ["cozy cafe", "rainy-day views", "relaxation spot"],
      },
    ],
    applicable_seasons: ["monsoon"],
  },
  {
    id: "module-summit-conqueror",
    name: "Summit Conqueror",
    narrative:
      "The call of the peak is a siren song you cannot resist. Today, you'll reach for the sky, pushing your limits on a quest for the ultimate panoramic view and the pride that comes with conquering new heights. ",
    activities: [
      {
        type: "morning",
        prompt_text:
          "Suggest an ambitious mountain climb or a high-altitude trek that requires an early start and significant endurance. Focus on the final ascent and the challenge it presents.",
        keywords: ["mountain climbing", "peak bagging", "alpine trekking"],
      },
      {
        type: "afternoon",
        prompt_text:
          "Suggest a technical or challenging downhill activity, such as mountain biking on a steep trail or rappelling down a cliff face.",
        keywords: [
          "rappelling",
          "downhill mountain biking",
          "technical descent",
        ],
      },
      {
        type: "evening",
        prompt_text:
          "Suggest a well-earned, remote camping spot with a clear view of the night sky, perfect for quiet reflection and a sense of victory.",
        keywords: ["remote camping", "star gazing", "reflection"],
      },
    ],
    applicable_seasons: ["spring", "autumn"],
  },
  {
    id: "module-urban-pulse-finder",
    name: "Urban Pulse Finder",
    narrative:
      "Today is for getting lost and finding yourself in the city's hidden corners. Forget the guidebook and follow the local energy, uncovering the real rhythm of urban life. ",
    activities: [
      {
        type: "morning",
        prompt_text:
          "Suggest a walking tour of a unique, non-touristy neighborhood. The focus should be on observation and discovery, not major landmarks.",
        keywords: ["neighborhood walk", "local discovery", "hidden alleys"],
      },
      {
        type: "afternoon",
        prompt_text:
          "Suggest a trip to a bustling local market or a unique community space where the culture of the city is on full display.",
        keywords: ["local market", "community center", "unique shops"],
      },
      {
        type: "evening",
        prompt_text:
          "Suggest a spot where locals gather for a laid-back night, such as a casual pub, a live music venue, or a park with a view.",
        keywords: ["local pub", "live music", "night stroll"],
      },
    ],
    applicable_seasons: ["all"],
  },
  {
    id: "module-gastronomic-quest",
    name: "Gastronomic Quest",
    narrative:
      "A city’s true story is often told through its flavors. Your mission today is to embark on a culinary journey, from street food stalls to hidden local kitchens. ",
    activities: [
      {
        type: "morning",
        prompt_text:
          "Suggest a food tour focused on local breakfast specialties, perhaps at a small, family-run eatery or a popular street vendor.",
        keywords: ["food tour", "local breakfast", "street food"],
      },
      {
        type: "afternoon",
        prompt_text:
          "Suggest a visit to a local spice market or a cooking class where the traveler can learn about regional cuisine and ingredients.",
        keywords: ["cooking class", "spice market", "regional food"],
      },
      {
        type: "evening",
        prompt_text:
          "Suggest a dinner spot that is famous among locals but not widely known to tourists. The focus should be on authenticity and unique dishes.",
        keywords: ["authentic dining", "local favorite", "hidden restaurant"],
      },
    ],
    applicable_seasons: ["all"],
  },
  {
    id: "module-street-art-crusade",
    name: "Street Art Crusade",
    narrative:
      "Every wall tells a story, and today you’ll read them all. Your quest is to uncover the city’s creative soul, from grand murals to small, thought-provoking stencils. ",
    activities: [
      {
        type: "morning",
        prompt_text:
          "Suggest a self-guided or local-guided tour of the city’s most famous street art districts or a specific neighborhood known for its murals.",
        keywords: ["street art tour", "graffiti art", "murals"],
      },
      {
        type: "afternoon",
        prompt_text:
          "Suggest a visit to a contemporary art gallery or an independent artist's studio, providing a deeper look into the city's creative scene.",
        keywords: ["art gallery", "independent artists", "studio visit"],
      },
      {
        type: "evening",
        prompt_text:
          "Suggest a venue for live performance, like an open-mic night, a small theater, or a poetry slam, to experience the city's living art.",
        keywords: ["live performance", "open mic", "small theater"],
      },
    ],
    applicable_seasons: ["all"],
  },
  {
    id: "module-urban-by-night",
    name: "Urban by Night",
    narrative:
      "When the sun goes down, the city reveals a new face. Tonight is about chasing the neon lights and discovering the high-energy, electrifying side of the urban landscape. ",
    activities: [
      {
        type: "evening",
        prompt_text:
          "Suggest a few options for nightlife, such as a rooftop bar with great views, a club with local DJs, or a lively street known for its late-night food stalls.",
        keywords: ["rooftop bar", "nightclub", "late-night food"],
      },
      {
        type: "late-night",
        prompt_text:
          "Suggest an after-hours activity that is unique to the city. This could be a late-night street food tour, a visit to a 24-hour market, or a ghost tour.",
        keywords: ["late-night tour", "24-hour market", "ghost tour"],
      },
      {
        type: "transport",
        prompt_text:
          "Suggest safe and reliable transport options for navigating the city at night, such as ride-sharing services, night buses, or a trustworthy taxi service.",
        keywords: ["night transport", "safe travel", "ride-sharing"],
      },
    ],
    applicable_seasons: ["all"],
  },
  {
    id: "module-ancient-history-quest",
    name: "Ancient History Quest",
    narrative:
      "Today, you'll walk through the annals of time. Your journey is to explore the echoes of the past, deciphering the tales hidden in ancient stones and storied ruins. ",
    activities: [
      {
        type: "morning",
        prompt_text:
          "Suggest a historical monument, fort, or archaeological site with a captivating story. Focus on sites where a local guide can enhance the experience with detailed narratives.",
        keywords: [
          "historical site",
          "archaeological site",
          "forts",
          "guided tour",
        ],
      },
      {
        type: "afternoon",
        prompt_text:
          "Suggest a historical museum or an exhibition that provides a deeper understanding of the region's history, from its ancient origins to modern times.",
        keywords: ["museum", "historical exhibition", "artifacts"],
      },
      {
        type: "evening",
        prompt_text:
          "Suggest a light and sound show or a traditional storytelling performance that brings the history of the place to life in a dramatic way.",
        keywords: [
          "light and sound show",
          "traditional storytelling",
          "history performance",
        ],
      },
    ],
    applicable_seasons: ["all"],
  },
  {
    id: "module-spiritual-journey",
    name: "Spiritual Journey",
    narrative:
      "Today is a quest for the inner self. You will find serenity and meaning in the spiritual heart of the region, connecting with ancient beliefs and tranquil practices. ",
    activities: [
      {
        type: "morning",
        prompt_text:
          "Suggest a visit to a significant temple, monastery, or pilgrimage site. The focus should be on experiencing the atmosphere and spiritual practices.",
        keywords: [
          "temple",
          "monastery",
          "pilgrimage site",
          "spiritual practice",
        ],
      },
      {
        type: "afternoon",
        prompt_text:
          "Suggest a calming activity that provides insight into the local spiritual life, such as a yoga or meditation session, or a quiet walk through a sacred garden.",
        keywords: ["yoga", "meditation", "sacred garden"],
      },
      {
        type: "evening",
        prompt_text:
          "Suggest a place to witness a traditional ritual, such as a Ganga Aarti ceremony, a sunset prayer, or a local chant session.",
        keywords: [
          "traditional ritual",
          "religious ceremony",
          "sunset prayers",
        ],
      },
    ],
    applicable_seasons: ["all"],
  },
  {
    id: "module-art-and-craft-mastery",
    name: "Art & Craft Mastery",
    narrative:
      "Today, you'll meet the creators and learn their secrets. Your journey is to engage with the living art and craft traditions, understanding the creativity that shapes the local identity. ",
    activities: [
      {
        type: "morning",
        prompt_text:
          "Suggest a visit to an artisan's village or a local craft workshop where the traveler can see traditional art being made and meet the artists.",
        keywords: ["craft workshop", "artisan village", "local art"],
      },
      {
        type: "afternoon",
        prompt_text:
          "Suggest a hands-on activity like a pottery class, a painting workshop, or a session on traditional weaving, allowing the traveler to create their own souvenir.",
        keywords: ["pottery class", "painting workshop", "traditional weaving"],
      },
      {
        type: "evening",
        prompt_text:
          "Suggest a traditional folk music or dance performance, or a venue where local artists showcase their work in a lively atmosphere.",
        keywords: ["folk music", "traditional dance", "art showcase"],
      },
    ],
    applicable_seasons: ["all"],
  },
  {
    id: "module-culinary-traditions",
    name: "Culinary Traditions",
    narrative:
      "Every dish has a history. Your quest is to taste the traditions of the region, from ancient recipes passed down through generations to the secrets of the local spice trade. ",
    activities: [
      {
        type: "morning",
        prompt_text:
          "Suggest a traditional cooking class that focuses on regional recipes, explaining the history and cultural significance of the dishes.",
        keywords: [
          "traditional cooking class",
          "regional recipes",
          "culinary history",
        ],
      },
      {
        type: "afternoon",
        prompt_text:
          "Suggest a visit to a local spice plantation or a traditional market where the traveler can learn about the ingredients and flavors that define the local cuisine.",
        keywords: ["spice plantation", "local market", "culinary tour"],
      },
      {
        type: "evening",
        prompt_text:
          "Suggest an authentic, family-run restaurant or a unique dining experience that serves traditional dishes and tells a story.",
        keywords: [
          "authentic restaurant",
          "family-run eatery",
          "traditional dinner",
        ],
      },
    ],
    applicable_seasons: ["all"],
  },
  {
    id: "module-culinary-traditions",
    name: "Culinary Traditions",
    narrative:
      "Every dish has a history. Your quest is to taste the traditions of the region, from ancient recipes passed down through generations to the secrets of the local spice trade. ",
    activities: [
      {
        type: "morning",
        prompt_text:
          "Suggest a traditional cooking class that focuses on regional recipes, explaining the history and cultural significance of the dishes.",
        keywords: [
          "traditional cooking class",
          "regional recipes",
          "culinary history",
        ],
      },
      {
        type: "afternoon",
        prompt_text:
          "Suggest a visit to a local spice plantation or a traditional market where the traveler can learn about the ingredients and flavors that define the local cuisine.",
        keywords: ["spice plantation", "local market", "culinary tour"],
      },
      {
        type: "evening",
        prompt_text:
          "Suggest an authentic, family-run restaurant or a unique dining experience that serves traditional dishes and tells a story.",
        keywords: [
          "authentic restaurant",
          "family-run eatery",
          "traditional dinner",
        ],
      },
    ],
    applicable_seasons: ["all"],
  },
  {
    id: "module-inner-peace-retreat",
    name: "Inner Peace Retreat",
    narrative:
      "Today is dedicated to serenity. You will find a quiet space to reflect, meditate, and recharge your spirit, leaving the chaos of the outside world behind. ",
    activities: [
      {
        type: "morning",
        prompt_text:
          "Suggest a morning meditation session at a local ashram, a peaceful garden, or a secluded temple. The focus should be on silence and mindfulness.",
        keywords: ["meditation", "ashram", "quiet garden", "mindful practice"],
      },
      {
        type: "afternoon",
        prompt_text:
          "Suggest a quiet, reflective activity such as journaling in a peaceful cafe, reading a book in a serene library, or simply sitting in silence by a lake.",
        keywords: ["journaling", "quiet cafe", "silent reflection"],
      },
      {
        type: "evening",
        prompt_text:
          "Suggest a calming, low-energy activity like listening to soothing music, practicing a breathing exercise, or a silent walk under the stars.",
        keywords: ["soothing music", "breathing exercises", "stargazing"],
      },
    ],
    applicable_seasons: ["all"],
  },
  {
    id: "module-nature-therapy",
    name: "Nature Therapy",
    narrative:
      "Connect with the ultimate healer: nature. Today, you'll immerse yourself in a peaceful natural environment, finding calm in the sounds of the forest and the rhythm of the waves. ",
    activities: [
      {
        type: "morning",
        prompt_text:
          "Suggest a gentle nature walk or a forest-bathing session. The goal is to walk slowly and mindfully, observing the details of the natural world.",
        keywords: ["nature walk", "forest bathing", "mindful hiking"],
      },
      {
        type: "afternoon",
        prompt_text:
          "Suggest a peaceful activity by a body of water, like a serene lake, a quiet riverbank, or a tranquil beach. The focus is on the calming effect of water.",
        keywords: ["calm lake", "tranquil beach", "riverbank relaxation"],
      },
      {
        type: "evening",
        prompt_text:
          "Suggest a scenic viewpoint for a sunset and a moment of quiet reflection, allowing the traveler to feel a connection with the landscape.",
        keywords: ["sunset view", "scenic point", "nature connection"],
      },
    ],
    applicable_seasons: ["all"],
  },
  {
    id: "module-mindful-movement",
    name: "Mindful Movement",
    narrative:
      "Your body is your temple. Today is about gentle, deliberate movement, combining physical activity with mindfulness to create a feeling of flow and inner harmony. ",
    activities: [
      {
        type: "morning",
        prompt_text:
          "Suggest a sunrise yoga session, a Tai Chi class, or a gentle stretching session to start the day with intention and a sense of calm.",
        keywords: ["sunrise yoga", "Tai Chi", "gentle stretching"],
      },
      {
        type: "afternoon",
        prompt_text:
          "Suggest a peaceful walk, a slow bike ride, or a session of mindful photography, where the focus is on the journey, not the destination.",
        keywords: ["peaceful walk", "mindful photography", "slow biking"],
      },
      {
        type: "evening",
        prompt_text:
          "Suggest a warm-down activity like a float tank session, a relaxing massage, or a quiet dip in a hot spring to soothe the body and mind.",
        keywords: ["float tank", "relaxing massage", "hot spring"],
      },
    ],
    applicable_seasons: ["all"],
  },
  {
    id: "module-culinary-serenity",
    name: "Culinary Serenity",
    narrative:
      "Food is medicine for the soul. Today, you'll nourish your body and mind with wholesome, calming meals, experiencing a new kind of peace through mindful eating. ",
    activities: [
      {
        type: "morning",
        prompt_text:
          "Suggest a quiet spot for a healthy, nutritious breakfast. The focus is on a slow, deliberate meal in a serene environment.",
        keywords: ["healthy breakfast", "quiet dining", "mindful eating"],
      },
      {
        type: "afternoon",
        prompt_text:
          "Suggest a visit to a local spice garden, a tea plantation, or a workshop on making traditional calming drinks or herbal remedies.",
        keywords: ["spice garden", "tea plantation", "herbal remedies"],
      },
      {
        type: "evening",
        prompt_text:
          "Suggest a dining experience focused on simple, wholesome food in a peaceful, natural setting, like a farm-to-table restaurant or a quiet garden cafe.",
        keywords: ["wholesome food", "farm-to-table", "garden cafe"],
      },
    ],
    applicable_seasons: ["all"],
  },
  {
    id: "module-street-food-safari",
    name: "Street Food Safari",
    narrative:
      "Today, you're on the ultimate food hunt. Your mission is to dive into the city’s bustling street food scene, sampling authentic, no-frills flavors that tell the real story of the region. ",
    activities: [
      {
        type: "morning",
        prompt_text:
          "Suggest a morning street food tour to sample local breakfast snacks and beverages. Focus on a popular food street or a lively market area.",
        keywords: [
          "street food tour",
          "local snacks",
          "food street",
          "breakfast",
        ],
      },
      {
        type: "afternoon",
        prompt_text:
          "Suggest a famous local street stall or a food court known for a specific regional delicacy. The recommendation should include the history and cultural significance of the dish.",
        keywords: [
          "regional delicacy",
          "famous street stall",
          "local food court",
        ],
      },
      {
        type: "evening",
        prompt_text:
          "Suggest a bustling night market or a food street that comes alive after dark. Highlight a few must-try evening street food items.",
        keywords: ["night market", "evening food walk", "local dessert"],
      },
    ],
    applicable_seasons: ["all"],
  },
  {
    id: "module-fine-dining-explorer",
    name: "Fine Dining Explorer",
    narrative:
      "Today is for savoring artistry. You will explore the pinnacle of local gastronomy, from chef-driven restaurants to a unique fine dining experience that elevates regional flavors. ",
    activities: [
      {
        type: "lunch",
        prompt_text:
          "Suggest a mid-range to high-end restaurant for lunch that is celebrated for its unique take on local cuisine. Highlight a signature dish or a tasting menu.",
        keywords: [
          "fine dining",
          "chef-driven restaurant",
          "modern cuisine",
          "tasting menu",
        ],
      },
      {
        type: "afternoon",
        prompt_text:
          "Suggest a sophisticated coffee shop or a dessert lounge that specializes in artisanal creations or unique, traditional sweets with a modern twist.",
        keywords: ["dessert lounge", "artisanal coffee", "unique pastries"],
      },
      {
        type: "dinner",
        prompt_text:
          "Suggest a top-tier restaurant for dinner. The recommendation should describe the ambiance, a few key dishes, and the overall dining experience.",
        keywords: ["luxury dining", "gourmet meal", "signature dishes"],
      },
    ],
    applicable_seasons: ["all"],
  },
  {
    id: "module-culinary-masterclass",
    name: "Culinary Masterclass",
    narrative:
      "Today, you’re not just a diner—you're a chef in training. Your mission is to get hands-on with the ingredients and techniques that define the region's cuisine. ",
    activities: [
      {
        type: "morning",
        prompt_text:
          "Suggest a cooking class that offers a deep dive into traditional regional dishes. The experience should be hands-on and led by a knowledgeable local chef.",
        keywords: ["cooking class", "culinary workshop", "traditional recipes"],
      },
      {
        type: "afternoon",
        prompt_text:
          "Suggest a specialty food shop or a spice market where the traveler can buy fresh ingredients and rare spices to take a piece of the local flavor home.",
        keywords: ["spice market", "gourmet food shop", "local ingredients"],
      },
      {
        type: "evening",
        prompt_text:
          "Suggest a dinner where the traveler can enjoy the dishes they prepared in their cooking class, or a restaurant that serves similar traditional food.",
        keywords: ["homemade meal", "traditional dinner", "culinary reward"],
      },
    ],
    applicable_seasons: ["all"],
  },
  {
    id: "module-local-produce-market",
    name: "Local Produce Market",
    narrative:
      "Every great meal begins at the source. Today is for connecting with the land and the people who farm it, exploring local produce and artisan goods at a lively market. ",
    activities: [
      {
        type: "morning",
        prompt_text:
          "Suggest a visit to a large farmers' market or a local fish market. The focus should be on seeing and learning about the fresh, local produce and specialties.",
        keywords: [
          "farmers market",
          "fish market",
          "local produce",
          "fresh ingredients",
        ],
      },
      {
        type: "afternoon",
        prompt_text:
          "Suggest a vineyard, brewery, or a tea plantation tour. The focus should be on tasting and learning about the production of local beverages and goods.",
        keywords: [
          "vineyard tour",
          "brewery tour",
          "tea tasting",
          "local drinks",
        ],
      },
      {
        type: "evening",
        prompt_text:
          "Suggest a dining experience that specifically uses farm-to-table or sea-to-table ingredients sourced directly from local producers.",
        keywords: [
          "farm-to-table restaurant",
          "sea-to-table",
          "local sourced dining",
        ],
      },
    ],
    applicable_seasons: ["all"],
  },
];

export const seedDatabase = async () => {
  try {
    console.log("Checking if database needs seeding...");

    // Seed Personas
    const personasCollection = db.collection("personas");
    const personasBatch = db.batch();
    for (const persona of personas) {
      const docRef = personasCollection.doc(persona.id);
      personasBatch.set(docRef, persona, { merge: true });
    }
    await personasBatch.commit();
    console.log("'personas' collection is up to date.");

    const quizQuestionsCollection = db.collection("quiz_questions");
    const questionsBatch = db.batch();
    let questionsSeeded = 0;
    for (const question of quizQuestions) {
      const docRef = quizQuestionsCollection.doc(question.id);
      questionsBatch.set(docRef, question, { merge: true });
    }
    await questionsBatch.commit();
    console.log("'quiz_questions' collection is up to date.");

    const modulesCollection = db.collection("itinerary_modules");
    const modulesBatch = db.batch();
    for (const module of itineraryModules) {
      const docRef = modulesCollection.doc(module.id);
      modulesBatch.set(docRef, module, { merge: true });
    }
    await modulesBatch.commit();
    console.log("'itinerary_modules' collection is up to date.");

    console.log("Seeding check complete.");
  } catch (error) {
    console.error("Error during database seeding:", error);
  }
};
