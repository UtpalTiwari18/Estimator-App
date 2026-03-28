const zipCodes = [
  "75001","75006","75019","75038","75039","75040","75043","75050","75052","75060",
  "75061","75062","75063","75067","75068","75069","75070","75074","75075","75080",
  "75081","75082","75093","75201","75204","75206","75214","75219","75220","75225",
  "75228","75231","75234","75240","76006","76010","76011","76012","76013","76014",
  "76015","76016","76017","76018","76021","76022","76034","76039","76040","76051"
];

const firstNames = ["Liam","Noah","Oliver","Elijah","James","William","Benjamin","Lucas","Henry","Alexander"];
const lastNames = ["Carter","Reed","Brooks","Hayes","Price","Parker","Collins","Kelly","Morgan","Ward"];

function generateCustomer(i) {
  const firstName = firstNames[i % firstNames.length];
  const lastName = lastNames[Math.floor(i / 10) % lastNames.length];

  return {
    firstName,
    lastName,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@gmail.com`,
    phone: `214555${String(1000 + i).slice(-4)}`,
    zip: zipCodes[i % zipCodes.length],
    password: `Test@${1000 + i}`,
    terms: true
  };
}

async function seedCustomers() {
  let success = 0;
  let fail = 0;

  for (let i = 1; i <= 100; i++) {
    const customer = generateCustomer(i);

    try {
      const res = await fetch("http://localhost:5000/api/customers/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(customer)
      });

      const data = await res.json();

      if (res.ok) {
        success++;
        console.log(`✅ ${customer.email}`);
      } else {
        fail++;
        console.log(`❌ ${customer.email} → ${data.message}`);
      }

    } catch (err) {
      fail++;
      console.log(`❌ ERROR for ${customer.email}`);
    }
  }

  console.log("\nDONE");
  console.log("Success:", success);
  console.log("Failed:", fail);
}

seedCustomers();