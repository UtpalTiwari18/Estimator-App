const cityZipPairs = [
  { city: "Dallas", zip: "75201" },
  { city: "Dallas", zip: "75204" },
  { city: "Dallas", zip: "75206" },
  { city: "Dallas", zip: "75214" },
  { city: "Dallas", zip: "75219" },
  { city: "Dallas", zip: "75220" },
  { city: "Dallas", zip: "75225" },
  { city: "Dallas", zip: "75228" },
  { city: "Dallas", zip: "75231" },
  { city: "Dallas", zip: "75234" },
  { city: "Dallas", zip: "75240" },
  { city: "Irving", zip: "75038" },
  { city: "Irving", zip: "75039" },
  { city: "Irving", zip: "75060" },
  { city: "Irving", zip: "75061" },
  { city: "Irving", zip: "75062" },
  { city: "Irving", zip: "75063" },
  { city: "Grand Prairie", zip: "75050" },
  { city: "Grand Prairie", zip: "75052" },
  { city: "Richardson", zip: "75080" },
  { city: "Richardson", zip: "75081" },
  { city: "Richardson", zip: "75082" },
  { city: "Addison", zip: "75001" },
  { city: "Carrollton", zip: "75006" },
  { city: "Coppell", zip: "75019" },
  { city: "Lewisville", zip: "75067" },
  { city: "Lewisville", zip: "75068" },
  { city: "Allen", zip: "75013" },
  { city: "Allen", zip: "75002" },
  { city: "Plano", zip: "75023" },
  { city: "Plano", zip: "75024" },
  { city: "Plano", zip: "75025" },
  { city: "Plano", zip: "75074" },
  { city: "Plano", zip: "75075" },
  { city: "Frisco", zip: "75033" },
  { city: "Frisco", zip: "75034" },
  { city: "Frisco", zip: "75035" },
  { city: "McKinney", zip: "75069" },
  { city: "McKinney", zip: "75070" },
  { city: "Arlington", zip: "76006" },
  { city: "Arlington", zip: "76010" },
  { city: "Arlington", zip: "76011" },
  { city: "Arlington", zip: "76012" },
  { city: "Arlington", zip: "76013" },
  { city: "Arlington", zip: "76014" },
  { city: "Arlington", zip: "76015" },
  { city: "Arlington", zip: "76016" },
  { city: "Arlington", zip: "76017" },
  { city: "Arlington", zip: "76018" },
  { city: "Euless", zip: "76039" },
  { city: "Euless", zip: "76040" },
  { city: "Bedford", zip: "76021" },
  { city: "Hurst", zip: "76053" },
  { city: "Grapevine", zip: "76051" },
  { city: "Colleyville", zip: "76034" },
  { city: "Fort Worth", zip: "76102" },
  { city: "Fort Worth", zip: "76104" },
  { city: "Fort Worth", zip: "76107" },
  { city: "Fort Worth", zip: "76109" }
];

const businessTypes = [
  "workshop",
  "detailer",
  "mechanic",
  "tireShop",
  "bodyShop",
  "electricalShop"
];

const ownerFirstNames = [
  "Liam", "Noah", "Olivia", "Emma", "Ava",
  "Mason", "Sophia", "James", "Lucas", "Mia",
  "Ethan", "Amelia", "Logan", "Isabella", "Elijah",
  "Charlotte", "Benjamin", "Harper", "Henry", "Evelyn"
];

const ownerLastNames = [
  "Carter", "Reed", "Brooks", "Hayes", "Price",
  "Parker", "Collins", "Kelly", "Morgan", "Ward",
  "Russell", "Cooper", "Bailey", "Murphy", "Bell",
  "Barnes", "Powell", "Jenkins", "Perry", "Long"
];

const streetNames = [
  "Main St", "Elm St", "Oak Ave", "Maple Dr", "Cedar Hill Rd",
  "Walnut St", "Park Blvd", "Pioneer Pkwy", "Belt Line Rd", "Mockingbird Ln",
  "Preston Rd", "Trinity Blvd", "Mid Cities Blvd", "Green Oaks Blvd", "Camp Bowie Blvd",
  "Coit Rd", "Plano Pkwy", "Legacy Dr", "Independence Pkwy", "Randol Mill Rd"
];

// These are the exact services from your dropdown
const servicesByCategory = {
  interior: [
    "Interior Detailing",
    "Seat Cleaning",
    "Carpet Shampoo",
    "Dashboard Restoration",
    "Odor Removal",
    "AC Sanitization"
  ],
  exterior: [
    "Car Wash & Detailing",
    "Paint Correction",
    "Ceramic Coating",
    "Wax & Polish",
    "Scratch Removal",
    "Headlight Restoration",
    "Windshield Repair"
  ],
  mechanical: [
    "Engine Diagnostics",
    "Oil Change",
    "Brake Service",
    "Suspension Repair",
    "Battery Replacement",
    "Transmission Service",
    "Cooling System Repair"
  ],
  electrical: [
    "ECU Diagnostics",
    "Sensor Replacement",
    "Wiring Repair",
    "Alternator Service",
    "Starter Repair",
    "Lighting Installation"
  ],
  tireWheel: [
    "Tire Replacement",
    "Wheel Alignment",
    "Wheel Balancing",
    "Tire Rotation",
    "Rim Repair"
  ],
  customization: [
    "Audio Installation",
    "Reverse Camera Setup",
    "Window Tinting",
    "Performance Tuning",
    "Body Kit Installation"
  ]
};

const categoryKeys = Object.keys(servicesByCategory);

function getRandomServices(index) {
  const primaryCategory = categoryKeys[index % categoryKeys.length];
  const primaryServices = servicesByCategory[primaryCategory];

  const serviceCount = (index % 3) + 1; // 1 to 3 services
  const picked = [];

  for (let i = 0; i < serviceCount; i++) {
    const service = primaryServices[(index + i) % primaryServices.length];
    if (!picked.includes(service)) {
      picked.push(service);
    }
  }

  // every 4th business gets one extra service from another category
  if (index % 4 === 0) {
    const secondaryCategory = categoryKeys[(index + 2) % categoryKeys.length];
    const secondaryServices = servicesByCategory[secondaryCategory];
    const extraService = secondaryServices[index % secondaryServices.length];

    if (!picked.includes(extraService)) {
      picked.push(extraService);
    }
  }

  return picked.join(", ");
}

function inferBusinessTypeFromServices(services) {
  const serviceText = services.toLowerCase();

  if (
    serviceText.includes("tire") ||
    serviceText.includes("wheel") ||
    serviceText.includes("rim")
  ) {
    return "tireShop";
  }

  if (
    serviceText.includes("interior") ||
    serviceText.includes("detailing") ||
    serviceText.includes("ceramic") ||
    serviceText.includes("wax") ||
    serviceText.includes("paint correction")
  ) {
    return "detailer";
  }

  if (
    serviceText.includes("ecu") ||
    serviceText.includes("sensor") ||
    serviceText.includes("wiring") ||
    serviceText.includes("alternator") ||
    serviceText.includes("starter") ||
    serviceText.includes("lighting")
  ) {
    return "electricalShop";
  }

  if (
    serviceText.includes("body kit") ||
    serviceText.includes("window tinting")
  ) {
    return "bodyShop";
  }

  if (
    serviceText.includes("engine") ||
    serviceText.includes("oil") ||
    serviceText.includes("brake") ||
    serviceText.includes("suspension") ||
    serviceText.includes("transmission") ||
    serviceText.includes("cooling")
  ) {
    return "mechanic";
  }

  return "workshop";
}

function makeBusinessName(index, businessType, city) {
  const prefixes = [
    "Elite", "Prime", "Metro", "Rapid", "Trusted",
    "Lone Star", "DFW", "Summit", "Precision", "Pro"
  ];

  const suffixMap = {
    workshop: "Auto Garage",
    detailer: "Detail Studio",
    mechanic: "Auto Repair",
    tireShop: "Tire Center",
    bodyShop: "Customization Garage",
    electricalShop: "Diagnostics Lab"
  };

  const prefix = prefixes[index % prefixes.length];
  const suffix = suffixMap[businessType] || "Auto Services";

  return `${prefix} ${city} ${suffix} ${index + 1}`;
}

function makeAddressLine1(index) {
  const buildingNumber = 1000 + index * 7;
  const streetName = streetNames[index % streetNames.length];
  return `${buildingNumber} ${streetName}`;
}

function makeAddressLine2(index) {
  const options = [
    `Suite ${100 + index}`,
    `Unit ${10 + index}`,
    `Floor ${1 + (index % 4)}`,
    `Building ${String.fromCharCode(65 + (index % 5))}`,
    ""
  ];

  return options[index % options.length];
}

function makeOwnerName(index) {
  const firstName = ownerFirstNames[index % ownerFirstNames.length];
  const lastName = ownerLastNames[Math.floor(index / ownerFirstNames.length) % ownerLastNames.length];
  return `${firstName} ${lastName}`;
}

function generateBusiness(index) {
  const location = cityZipPairs[index % cityZipPairs.length];
  const ownerName = makeOwnerName(index);
  const services = getRandomServices(index);
  const businessType = inferBusinessTypeFromServices(services);
  const businessName = makeBusinessName(index, businessType, location.city);
  const addressLine1 = makeAddressLine1(index);
  const addressLine2 = makeAddressLine2(index);
  const emailSlug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, "");
  const websiteSlug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const phone = `469555${String(1000 + index).slice(-4)}`;

  return {
    businessName,
    ownerName,
    businessType,
    email: `${emailSlug}@gmail.com`,
    phone,
    website: `https://www.${websiteSlug}.com`,
    services,
    addressLine1,
    addressLine2,
    city: location.city,
    state: "TX",
    zip: location.zip,
    password: `BizTest@${2000 + index}`,
    terms: true
  };
}

const businesses = [];

for (let i = 0; i < 100; i++) {
  businesses.push(generateBusiness(i));
}

async function seedBusinesses() {
  let successCount = 0;
  let failCount = 0;

  for (const business of businesses) {
    try {
      const response = await fetch("http://localhost:5000/api/business/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(business)
      });

      const result = await response.json();

      if (response.ok) {
        successCount++;
        console.log(`✅ ${business.email} -> ${result.message}`);
      } else {
        failCount++;
        console.log(`❌ ${business.email} -> ${result.message}`);
      }
    } catch (error) {
      failCount++;
      console.log(`❌ ${business.email} -> ${error.message}`);
    }
  }

  console.log("\n--------------------------");
  console.log("Finished seeding businesses");
  console.log(`Successful: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  console.log("--------------------------");
}

seedBusinesses();