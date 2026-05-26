import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Clearing existing data...");
  await prisma.giftRecommendation.deleteMany();
  await prisma.contactInterest.deleteMany();
  await prisma.researchJob.deleteMany();
  await prisma.socialProfile.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.account.deleteMany();

  console.log("🏢 Seeding accounts...");

  const [
    veridian,
    nexus,
    pulseHR,
    folio,
    crestline,
    meridian,
    apex,
    luminary,
    solaris,
    orbis,
  ] = await Promise.all([
    prisma.account.create({
      data: {
        name: "Veridian Analytics",
        domain: "veridian.io",
        industry: "Analytics & Business Intelligence",
        city: "San Francisco",
        country: "USA",
        expectedAcv: 380000,
        tier: "STRATEGIC",
      },
    }),
    prisma.account.create({
      data: {
        name: "NexusCloud",
        domain: "nexuscloud.com",
        industry: "Cloud Infrastructure",
        city: "New York",
        country: "USA",
        expectedAcv: 315000,
        tier: "STRATEGIC",
      },
    }),
    prisma.account.create({
      data: {
        name: "PulseHR",
        domain: "pulsehr.io",
        industry: "HR Technology",
        city: "Austin",
        country: "USA",
        expectedAcv: 195000,
        tier: "ENTERPRISE",
      },
    }),
    prisma.account.create({
      data: {
        name: "Folio Finance",
        domain: "foliofinance.com",
        industry: "Financial Technology",
        city: "London",
        country: "UK",
        expectedAcv: 168000,
        tier: "ENTERPRISE",
      },
    }),
    prisma.account.create({
      data: {
        name: "Crestline Media",
        domain: "crestlinemedia.com",
        industry: "Media & AdTech",
        city: "Los Angeles",
        country: "USA",
        expectedAcv: 142000,
        tier: "ENTERPRISE",
      },
    }),
    prisma.account.create({
      data: {
        name: "Meridian Health",
        domain: "meridianhealth.co",
        industry: "Health Technology",
        city: "Chicago",
        country: "USA",
        expectedAcv: 95000,
        tier: "MID_MARKET",
      },
    }),
    prisma.account.create({
      data: {
        name: "Apex Logistics",
        domain: "apexlogistics.com",
        industry: "Supply Chain & Logistics",
        city: "Dallas",
        country: "USA",
        expectedAcv: 88000,
        tier: "MID_MARKET",
      },
    }),
    prisma.account.create({
      data: {
        name: "Luminary EdTech",
        domain: "luminaryedtech.com",
        industry: "Education Technology",
        city: "Boston",
        country: "USA",
        expectedAcv: 82000,
        tier: "MID_MARKET",
      },
    }),
    prisma.account.create({
      data: {
        name: "Solaris Energy",
        domain: "solarisen.io",
        industry: "Clean Technology",
        city: "Denver",
        country: "USA",
        expectedAcv: 75000,
        tier: "MID_MARKET",
      },
    }),
    prisma.account.create({
      data: {
        name: "Orbis Consulting",
        domain: "orbisconsulting.ca",
        industry: "Management Consulting",
        city: "Toronto",
        country: "Canada",
        expectedAcv: 178000,
        tier: "ENTERPRISE",
      },
    }),
  ]);

  console.log("👥 Seeding contacts and social profiles...");

  // ── Veridian Analytics (STRATEGIC, $380k) ────────────────────────────────
  const marcusChen = await prisma.contact.create({
    data: {
      accountId: veridian.id,
      firstName: "Marcus",
      lastName: "Chen",
      title: "Chief Executive Officer",
      email: "marcus.chen@veridian.io",
      city: "San Francisco",
      country: "USA",
      seniority: "C-Suite",
    },
  });
  await prisma.socialProfile.createMany({
    data: [
      {
        contactId: marcusChen.id,
        platform: "LINKEDIN",
        url: "https://linkedin.com/in/marcus-chen-veridian",
        rawText:
          "Thrilled to close our Series B and keep building the future of analytics! When I'm not obsessing over data pipelines, I'm logging miles. Just crossed the finish line of my third marathon — 26.2 miles of pure discipline. Coffee is my co-pilot; currently hooked on single-origin Ethiopian beans from a roaster in the Mission. Dad of two incredible kids who insist that dad's job is 'fixing computers all day.' Family keeps me grounded when startup life gets intense.",
        lastScrapedAt: new Date("2026-05-20"),
      },
      {
        contactId: marcusChen.id,
        platform: "X",
        url: "https://x.com/marcuschen_data",
        rawText:
          "Running my first 50K ultramarathon next month. Training has been brutal but the discipline carries into the boardroom. Also: anyone else find that the best product decisions happen on long runs? Coffee first, data second, running third. #marathon #running #saas",
        lastScrapedAt: new Date("2026-05-22"),
      },
    ],
  });

  const sarahOkafor = await prisma.contact.create({
    data: {
      accountId: veridian.id,
      firstName: "Sarah",
      lastName: "Okafor",
      title: "VP of Sales",
      email: "sarah.okafor@veridian.io",
      city: "San Francisco",
      country: "USA",
      seniority: "VP",
    },
  });
  await prisma.socialProfile.create({
    data: {
      contactId: sarahOkafor.id,
      platform: "LINKEDIN",
      url: "https://linkedin.com/in/sarah-okafor",
      rawText:
        "Revenue milestone unlocked — so proud of this team! Heading to Barcelona next week for our EMEA customer conference; fourth country this quarter. My team jokes I live in airports. Outside of quota: I'm a jazz guitarist — terrible at it but obsessed. Currently re-reading 'The Mom Test' for the third time and working through a backlog of business books. Travel, music, and good books are how I decompress from the grind.",
      lastScrapedAt: new Date("2026-05-19"),
    },
  });

  const jamesPark = await prisma.contact.create({
    data: {
      accountId: veridian.id,
      firstName: "James",
      lastName: "Park",
      title: "Head of Partnerships",
      email: "james.park@veridian.io",
      city: "Oakland",
      country: "USA",
      seniority: "Director",
    },
  });
  await prisma.socialProfile.createMany({
    data: [
      {
        contactId: jamesPark.id,
        platform: "LINKEDIN",
        url: "https://linkedin.com/in/james-park-partnerships",
        rawText:
          "Partnership ecosystem at Veridian is growing fast! Left early today for my daughter's soccer game — she scored a hat trick last week, so proud. Big Warriors fan; catching NBA games at Chase Center whenever I can. At heart I'm a tech nerd: currently building a home automation system with Raspberry Pi and experimenting with machine learning models for home energy optimization. Open source contributor on weekends.",
        lastScrapedAt: new Date("2026-05-21"),
      },
    ],
  });

  // ── NexusCloud (STRATEGIC, $315k) ─────────────────────────────────────────
  const elenaVasquez = await prisma.contact.create({
    data: {
      accountId: nexus.id,
      firstName: "Elena",
      lastName: "Vasquez",
      title: "Chief Revenue Officer",
      email: "elena.vasquez@nexuscloud.com",
      city: "New York",
      country: "USA",
      seniority: "C-Suite",
    },
  });
  await prisma.socialProfile.createMany({
    data: [
      {
        contactId: elenaVasquez.id,
        platform: "LINKEDIN",
        url: "https://linkedin.com/in/elena-vasquez-cro",
        rawText:
          "Record quarter at NexusCloud — cloud infrastructure is having its moment. When the grind gets heavy, yoga is my reset. I practice vinyasa flow six mornings a week and just completed a 200-hour yoga teacher training. Travel is the other great love: I've visited 47 countries and counting, with Japan and Patagonia at the top of the next list. Exploring new cultures and cuisines recharges my creative thinking.",
        lastScrapedAt: new Date("2026-05-18"),
      },
      {
        contactId: elenaVasquez.id,
        platform: "INSTAGRAM",
        url: "https://instagram.com/elena.explores",
        rawText:
          "Morning yoga at sunrise in Tulum ☀️ There is nothing like a yoga practice on the beach to put everything in perspective. Adventure awaits — next up is hiking in Patagonia! Wanderlust never rests. #yoga #travel #adventure #patagonia",
        lastScrapedAt: new Date("2026-05-23"),
      },
    ],
  });

  const davidKim = await prisma.contact.create({
    data: {
      accountId: nexus.id,
      firstName: "David",
      lastName: "Kim",
      title: "VP of Engineering",
      email: "david.kim@nexuscloud.com",
      city: "New York",
      country: "USA",
      seniority: "VP",
    },
  });
  await prisma.socialProfile.create({
    data: {
      contactId: davidKim.id,
      platform: "LINKEDIN",
      url: "https://linkedin.com/in/davidkim-engineering",
      rawText:
        "Kubernetes 1.33 is out and I've been deep in the release notes. Open source is the lifeblood of cloud infrastructure — our team contributes to three CNCF projects. When I close the laptop, I'm a gamer: currently grinding through Elden Ring DLC and streaming on Twitch on weekends. Also co-host a gaming podcast about indie games and esports. PlayStation and PC master race, don't @ me.",
      lastScrapedAt: new Date("2026-05-20"),
    },
  });

  const priyaSharma = await prisma.contact.create({
    data: {
      accountId: nexus.id,
      firstName: "Priya",
      lastName: "Sharma",
      title: "Director of Enterprise Sales",
      email: "priya.sharma@nexuscloud.com",
      city: "Hoboken",
      country: "USA",
      seniority: "Director",
    },
  });
  await prisma.socialProfile.create({
    data: {
      contactId: priyaSharma.id,
      platform: "LINKEDIN",
      url: "https://linkedin.com/in/priya-sharma-sales",
      rawText:
        "Closed three enterprise deals this quarter — cloud sales is all about trust and timing. My real passion outside work is cooking. I grew up cooking with my mother and grandmother, and I still spend Sunday mornings mastering new recipes — mostly Indian cuisine but lately exploring French culinary techniques. I'm also an avid reader: currently working through a stack of nonfiction and just finished 'Sapiens' for the second time. Good food and good books are the foundations of a good life.",
      lastScrapedAt: new Date("2026-05-17"),
    },
  });

  // ── PulseHR (ENTERPRISE, $195k) ───────────────────────────────────────────
  const michaelTorres = await prisma.contact.create({
    data: {
      accountId: pulseHR.id,
      firstName: "Michael",
      lastName: "Torres",
      title: "VP of Sales",
      email: "michael.torres@pulsehr.io",
      city: "Austin",
      country: "USA",
      seniority: "VP",
    },
  });
  await prisma.socialProfile.createMany({
    data: [
      {
        contactId: michaelTorres.id,
        platform: "LINKEDIN",
        url: "https://linkedin.com/in/michael-torres-hr",
        rawText:
          "HR tech is transforming how companies hire and retain talent. Proud of what we've built at PulseHR. On weekends you'll find me on the golf course — shot my first sub-80 last weekend, huge milestone! Big NFL fan, season ticket holder for the Cowboys since 2015. Travel is also a big part of my life; I try to take the family on at least three international trips a year. Exploring new destinations is what keeps me sharp.",
        lastScrapedAt: new Date("2026-05-16"),
      },
    ],
  });

  const rachelGreen = await prisma.contact.create({
    data: {
      accountId: pulseHR.id,
      firstName: "Rachel",
      lastName: "Green",
      title: "Head of Customer Success",
      email: "rachel.green@pulsehr.io",
      city: "Austin",
      country: "USA",
      seniority: "Manager",
    },
  });
  await prisma.socialProfile.createMany({
    data: [
      {
        contactId: rachelGreen.id,
        platform: "LINKEDIN",
        url: "https://linkedin.com/in/rachel-green-cs",
        rawText:
          "Customer success is the heartbeat of any SaaS company. When I'm not working, I'm on my Peloton. I ride every morning before work — it's non-negotiable. Yoga keeps me flexible and centered; I've been practicing for eight years. Also picking up the piano again after a 10-year break — there's something meditative about learning music as an adult. Fitness and music are my two great passions outside of work.",
        lastScrapedAt: new Date("2026-05-21"),
      },
      {
        contactId: rachelGreen.id,
        platform: "INSTAGRAM",
        url: "https://instagram.com/rachel.rides",
        rawText:
          "Day 365 on the Peloton 🎉 A whole year of consecutive rides! Fitness is a lifestyle, not a phase. Also catching a concert tonight — jazz at the venue downtown. Music and movement, that's the recipe. #peloton #fitness #yoga #music #jazz",
        lastScrapedAt: new Date("2026-05-24"),
      },
    ],
  });

  const benNakamura = await prisma.contact.create({
    data: {
      accountId: pulseHR.id,
      firstName: "Ben",
      lastName: "Nakamura",
      title: "Chief Operating Officer",
      email: "ben.nakamura@pulsehr.io",
      city: "Austin",
      country: "USA",
      seniority: "C-Suite",
    },
  });
  await prisma.socialProfile.create({
    data: {
      contactId: benNakamura.id,
      platform: "LINKEDIN",
      url: "https://linkedin.com/in/ben-nakamura-ops",
      rawText:
        "Operations at scale is a beautiful puzzle. AI and machine learning are reshaping every workflow we have at PulseHR — I read every paper I can get my hands on. Father of three; my kids are my greatest project. Reading is my hobby: I average three books a month, mostly nonfiction — history, science, and business strategy. Currently deep in 'The Innovator's Dilemma' and a biography of Alan Turing. Family and books keep me sane.",
      lastScrapedAt: new Date("2026-05-19"),
    },
  });

  // ── Folio Finance (ENTERPRISE, $168k) ─────────────────────────────────────
  const charlotteWebb = await prisma.contact.create({
    data: {
      accountId: folio.id,
      firstName: "Charlotte",
      lastName: "Webb",
      title: "VP Sales EMEA",
      email: "charlotte.webb@foliofinance.com",
      city: "London",
      country: "UK",
      seniority: "VP",
    },
  });
  await prisma.socialProfile.createMany({
    data: [
      {
        contactId: charlotteWebb.id,
        platform: "LINKEDIN",
        url: "https://linkedin.com/in/charlotte-webb-fintech",
        rawText:
          "Fintech in EMEA is accelerating. Just wrapped a roadshow across Frankfurt, Amsterdam, and Dubai — love how each city has its own financial culture. Art is my other world; I sit on the advisory board of a contemporary gallery in Shoreditch and collect emerging artists. Weekend mornings are for hiking in the Peak District. The combination of art, travel, and outdoor fitness keeps my creative thinking sharp.",
        lastScrapedAt: new Date("2026-05-20"),
      },
    ],
  });

  const oliverHughes = await prisma.contact.create({
    data: {
      accountId: folio.id,
      firstName: "Oliver",
      lastName: "Hughes",
      title: "Head of Business Development",
      email: "oliver.hughes@foliofinance.com",
      city: "London",
      country: "UK",
      seniority: "Director",
    },
  });
  await prisma.socialProfile.create({
    data: {
      contactId: oliverHughes.id,
      platform: "LINKEDIN",
      url: "https://linkedin.com/in/oliver-hughes-bd",
      rawText:
        "Building partnerships across the European fintech ecosystem. Massive Premier League fan — Arsenal season ticket holder for fifteen years, through all the highs and the lows. Food is a serious hobby: I love cooking, especially French and Italian cuisine. Sunday roasts are a ritual. I've been experimenting with wine pairing and recently completed a WSET Level 2 course. Soccer, cooking, and wine are the pillars of a good weekend.",
      lastScrapedAt: new Date("2026-05-18"),
    },
  });

  // ── Crestline Media (ENTERPRISE, $142k) ───────────────────────────────────
  const dianaKim = await prisma.contact.create({
    data: {
      accountId: crestline.id,
      firstName: "Diana",
      lastName: "Kim",
      title: "Chief Executive Officer",
      email: "diana.kim@crestlinemedia.com",
      city: "Los Angeles",
      country: "USA",
      seniority: "C-Suite",
    },
  });
  await prisma.socialProfile.createMany({
    data: [
      {
        contactId: dianaKim.id,
        platform: "LINKEDIN",
        url: "https://linkedin.com/in/diana-kim-media",
        rawText:
          "Media is being reinvented in real time. Excited about what we're building at Crestline. On a personal level, I've been deeply invested in the LA art scene — I visit galleries every other weekend and recently started collecting photography as an art form. Hiking the Santa Monica Mountains is my weekly reset; there's nothing like a long trail run to clear the mind and gain perspective. Travel to new cities always feeds the creative well.",
        lastScrapedAt: new Date("2026-05-22"),
      },
      {
        contactId: dianaKim.id,
        platform: "INSTAGRAM",
        url: "https://instagram.com/diana.creates",
        rawText:
          "Golden hour at LACMA is unmatched. Art lives and breathes in this city. This weekend: hiking Temescal Canyon, then gallery hopping in Culver City. The balance between nature and culture is everything. Wanderlust hitting hard — planning a trip to Tokyo and Kyoto next quarter. #art #museum #hiking #travel #losangeles",
        lastScrapedAt: new Date("2026-05-25"),
      },
    ],
  });

  const alexRivera = await prisma.contact.create({
    data: {
      accountId: crestline.id,
      firstName: "Alex",
      lastName: "Rivera",
      title: "VP of Marketing",
      email: "alex.rivera@crestlinemedia.com",
      city: "Los Angeles",
      country: "USA",
      seniority: "VP",
    },
  });
  await prisma.socialProfile.create({
    data: {
      contactId: alexRivera.id,
      platform: "LINKEDIN",
      url: "https://linkedin.com/in/alex-rivera-marketing",
      rawText:
        "Content marketing in the streaming age is a fascinating challenge. Outside of work I'm a music obsessive — vinyl collector with over 400 records, mostly indie rock and 90s alternative. I go to three or four concerts a month; live music is the most authentic experience left. Currently obsessed with a new indie band from Bristol. Design and visual art are also passions — I sketch almost daily and recently started screen printing.",
      lastScrapedAt: new Date("2026-05-17"),
    },
  });

  // ── Meridian Health (MID_MARKET, $95k) ────────────────────────────────────
  const kevinWalsh = await prisma.contact.create({
    data: {
      accountId: meridian.id,
      firstName: "Kevin",
      lastName: "Walsh",
      title: "VP of Sales",
      email: "kevin.walsh@meridianhealth.co",
      city: "Chicago",
      country: "USA",
      seniority: "VP",
    },
  });
  await prisma.socialProfile.create({
    data: {
      contactId: kevinWalsh.id,
      platform: "LINKEDIN",
      url: "https://linkedin.com/in/kevin-walsh-health",
      rawText:
        "Healthcare SaaS is where technology actually saves lives. Proud to be part of the mission at Meridian. Born and raised in Chicago, so I bleed blue — huge Cubs and Bears fan. Baseball season is sacred in this household. Love to cook for the family on weekends; I make a smoked brisket that has become legendary among friends. Chicago deep-dish pizza debates aside, cooking is my therapy.",
      lastScrapedAt: new Date("2026-05-16"),
    },
  });

  const natalieBrooks = await prisma.contact.create({
    data: {
      accountId: meridian.id,
      firstName: "Natalie",
      lastName: "Brooks",
      title: "Head of Operations",
      email: "natalie.brooks@meridianhealth.co",
      city: "Chicago",
      country: "USA",
      seniority: "Manager",
    },
  });
  await prisma.socialProfile.createMany({
    data: [
      {
        contactId: natalieBrooks.id,
        platform: "LINKEDIN",
        url: "https://linkedin.com/in/natalie-brooks-ops",
        rawText:
          "Operations excellence is a team sport. At Meridian we've reduced onboarding time by 40% this year. Outside of work I'm a CrossFit coach — I've been coaching at my local box for three years. The gym is my community. Mom of two boys who keep me perpetually exhausted and grateful. Family and fitness are the twin pillars of my life outside the office.",
        lastScrapedAt: new Date("2026-05-19"),
      },
    ],
  });

  const ryanPatel = await prisma.contact.create({
    data: {
      accountId: meridian.id,
      firstName: "Ryan",
      lastName: "Patel",
      title: "Chief Technology Officer",
      email: "ryan.patel@meridianhealth.co",
      city: "Chicago",
      country: "USA",
      seniority: "C-Suite",
    },
  });
  await prisma.socialProfile.create({
    data: {
      contactId: ryanPatel.id,
      platform: "LINKEDIN",
      url: "https://linkedin.com/in/ryan-patel-cto",
      rawText:
        "AI in healthcare is the most consequential technology shift of our lifetime. We're building predictive models at Meridian that are genuinely improving patient outcomes. On evenings: I stream on Twitch — mostly strategy games and the occasional Warzone session. Gaming is how I switch off. Also a huge fan of cloud-native architecture; I contribute to a few open source Kubernetes operators. Tech and gaming are my twin obsessions.",
      lastScrapedAt: new Date("2026-05-20"),
    },
  });

  // ── Apex Logistics (MID_MARKET, $88k) ────────────────────────────────────
  const tomHardy = await prisma.contact.create({
    data: {
      accountId: apex.id,
      firstName: "Tom",
      lastName: "Hardy",
      title: "VP of Business Development",
      email: "tom.hardy@apexlogistics.com",
      city: "Dallas",
      country: "USA",
      seniority: "VP",
    },
  });
  await prisma.socialProfile.create({
    data: {
      contactId: tomHardy.id,
      platform: "LINKEDIN",
      url: "https://linkedin.com/in/tom-hardy-logistics",
      rawText:
        "Supply chain innovation is the unsung hero of modern commerce. Dallas is a great city to build from. Texan through and through — Cowboys fan since I could walk, season tickets in the family for three generations. I try to run every morning; working toward my first half marathon this fall. Fitness discipline maps directly to business discipline in my experience.",
      lastScrapedAt: new Date("2026-05-15"),
    },
  });

  const jessicaChen = await prisma.contact.create({
    data: {
      accountId: apex.id,
      firstName: "Jessica",
      lastName: "Chen",
      title: "Operations Director",
      email: "jessica.chen@apexlogistics.com",
      city: "Fort Worth",
      country: "USA",
      seniority: "Director",
    },
  });
  await prisma.socialProfile.create({
    data: {
      contactId: jessicaChen.id,
      platform: "LINKEDIN",
      url: "https://linkedin.com/in/jessica-chen-ops",
      rawText:
        "Logistics at scale is a masterclass in systems thinking. At home I'm a passionate reader — I average two books a week. Currently working through a mix of supply chain literature, literary fiction, and memoirs. My book club meets every two weeks. I also love to cook; nothing better than trying a new recipe from scratch on a Sunday afternoon. Mom of a toddler, so family time is precious and fiercely protected.",
      lastScrapedAt: new Date("2026-05-18"),
    },
  });

  // ── Luminary EdTech (MID_MARKET, $82k) ───────────────────────────────────
  const andrewScott = await prisma.contact.create({
    data: {
      accountId: luminary.id,
      firstName: "Andrew",
      lastName: "Scott",
      title: "Chief Executive Officer",
      email: "andrew.scott@luminaryedtech.com",
      city: "Boston",
      country: "USA",
      seniority: "C-Suite",
    },
  });
  await prisma.socialProfile.createMany({
    data: [
      {
        contactId: andrewScott.id,
        platform: "LINKEDIN",
        url: "https://linkedin.com/in/andrew-scott-edtech",
        rawText:
          "Education technology has the power to democratize opportunity. That's the mission every day at Luminary. I'm a voracious reader — four books a month minimum. Mostly technology history, philosophy of education, and startup strategy. Also a travel junkie: I try to visit at least two new countries per year; currently planning trips to Vietnam and Morocco. Technology and education reform are my twin passions and travel is how I feed them with new perspective.",
        lastScrapedAt: new Date("2026-05-17"),
      },
    ],
  });

  const lisaChang = await prisma.contact.create({
    data: {
      accountId: luminary.id,
      firstName: "Lisa",
      lastName: "Chang",
      title: "Head of Sales",
      email: "lisa.chang@luminaryedtech.com",
      city: "Boston",
      country: "USA",
      seniority: "Manager",
    },
  });
  await prisma.socialProfile.create({
    data: {
      contactId: lisaChang.id,
      platform: "LINKEDIN",
      url: "https://linkedin.com/in/lisa-chang-sales",
      rawText:
        "EdTech sales is mission-driven selling at its best. Outside the office I'm a cyclist — I ride 150 miles a week on my road bike and just completed the Pan-Mass Challenge charity ride. Boston's music scene is criminally underrated; I go to indie concerts at The Sinclair every few weeks. Cycling and live music are how I feed my soul when quota pressure gets intense.",
      lastScrapedAt: new Date("2026-05-20"),
    },
  });

  // ── Solaris Energy (MID_MARKET, $75k) ────────────────────────────────────
  const chrisMartinez = await prisma.contact.create({
    data: {
      accountId: solaris.id,
      firstName: "Chris",
      lastName: "Martinez",
      title: "VP of Sales",
      email: "chris.martinez@solarisen.io",
      city: "Denver",
      country: "USA",
      seniority: "VP",
    },
  });
  await prisma.socialProfile.createMany({
    data: [
      {
        contactId: chrisMartinez.id,
        platform: "LINKEDIN",
        url: "https://linkedin.com/in/chris-martinez-energy",
        rawText:
          "Clean energy is the defining market of our generation. Proud to be driving adoption at Solaris. Colorado is my playground — I hike every weekend, mostly 14ers. Completed 42 of Colorado's 58 fourteeners and counting. Also an avid trail runner. The mountains teach you humility and resilience, which makes you better at sales.",
        lastScrapedAt: new Date("2026-05-16"),
      },
      {
        contactId: chrisMartinez.id,
        platform: "INSTAGRAM",
        url: "https://instagram.com/chris.climbs.colorado",
        rawText:
          "Summit #42 in the books! Mt. Elbert in perfect conditions. The adventure never gets old. Next weekend: Capitol Peak. Hiking and trail running are my therapy. Wanderlust is real — already planning an adventure trip to Patagonia next year. #hiking #14ers #colorado #trailrunning #adventure",
        lastScrapedAt: new Date("2026-05-23"),
      },
    ],
  });

  const amandaFoster = await prisma.contact.create({
    data: {
      accountId: solaris.id,
      firstName: "Amanda",
      lastName: "Foster",
      title: "Chief Financial Officer",
      email: "amanda.foster@solarisen.io",
      city: "Denver",
      country: "USA",
      seniority: "C-Suite",
    },
  });
  await prisma.socialProfile.create({
    data: {
      contactId: amandaFoster.id,
      platform: "LINKEDIN",
      url: "https://linkedin.com/in/amanda-foster-cfo",
      rawText:
        "Clean energy finance is the most exciting space in sustainable investing right now. Art is my escape from spreadsheets — I paint in watercolors and recently had work shown in a small gallery in RiNo. Denver's art scene is genuinely thriving. I'm also a committed reader: my nightstand always has two or three books on it. Love a good food experience too — I try every new restaurant that opens in Denver's dining scene.",
      lastScrapedAt: new Date("2026-05-19"),
    },
  });

  const jakeWilson = await prisma.contact.create({
    data: {
      accountId: solaris.id,
      firstName: "Jake",
      lastName: "Wilson",
      title: "Head of Partnerships",
      email: "jake.wilson@solarisen.io",
      city: "Boulder",
      country: "USA",
      seniority: "Manager",
    },
  });
  await prisma.socialProfile.create({
    data: {
      contactId: jakeWilson.id,
      platform: "LINKEDIN",
      url: "https://linkedin.com/in/jake-wilson-partnerships",
      rawText:
        "Building the clean energy partnership ecosystem from Boulder. I'm a tech optimist — AI and machine learning applied to energy grid optimization is genuinely one of the most exciting spaces right now. Weekends are for skiing in the winter and mountain biking in the summer. Colorado sports are a religion out here: massive Broncos fan. Also dabble in coding on the side — built a personal energy dashboard with Python and Grafana.",
      lastScrapedAt: new Date("2026-05-18"),
    },
  });

  // ── Orbis Consulting (ENTERPRISE, $178k) ──────────────────────────────────
  const sophieTrudeau = await prisma.contact.create({
    data: {
      accountId: orbis.id,
      firstName: "Sophie",
      lastName: "Trudeau",
      title: "Principal Consultant",
      email: "sophie.trudeau@orbisconsulting.ca",
      city: "Toronto",
      country: "Canada",
      seniority: "Senior Individual Contributor",
    },
  });
  await prisma.socialProfile.createMany({
    data: [
      {
        contactId: sophieTrudeau.id,
        platform: "LINKEDIN",
        url: "https://linkedin.com/in/sophie-trudeau-consulting",
        rawText:
          "Digital transformation in professional services is moving faster than anyone predicted. Just back from a client engagement in Singapore — love how every city has its own approach to business culture. Food is a serious pursuit: I dine at every notable restaurant when I travel, and at home I cook elaborate meals on weekends. Toronto's food scene has grown dramatically. Art galleries are my weekend ritual; there's always something new at the AGO or Gardiner Museum.",
        lastScrapedAt: new Date("2026-05-21"),
      },
    ],
  });

  const markBennett = await prisma.contact.create({
    data: {
      accountId: orbis.id,
      firstName: "Mark",
      lastName: "Bennett",
      title: "Director of Digital Strategy",
      email: "mark.bennett@orbisconsulting.ca",
      city: "Toronto",
      country: "Canada",
      seniority: "Director",
    },
  });
  await prisma.socialProfile.create({
    data: {
      contactId: markBennett.id,
      platform: "LINKEDIN",
      url: "https://linkedin.com/in/mark-bennett-digital",
      rawText:
        "AI strategy and digital transformation are where I spend most of my brain cycles at Orbis. Machine learning adoption in enterprise consulting is accelerating rapidly. Off the clock: I'm an avid gamer — grew up on Nintendo and now split time between PC gaming and Xbox. Big music fan: I go to concerts regularly and have been collecting vinyl for ten years. Currently obsessed with the new wave of electronic music and ambient artists. Tech, gaming, and music form my holy trinity.",
      lastScrapedAt: new Date("2026-05-22"),
    },
  });

  console.log("✅ Seed complete!");
  console.log(`   Accounts: 10`);
  console.log(`   Contacts: 25`);
  console.log(
    `   Run 'npm run worker' to start the background job processor, or click Research on any contact.`
  );
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
