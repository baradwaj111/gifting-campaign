import type { AccountTier, GiftCategory, GiftStatus, GiftType, InterestCategory } from "@/generated/prisma/enums";

export type GiftInput = {
  contactId: string;
  interestId?: string;
  title: string;
  description: string;
  category: GiftCategory;
  estimatedCost: number;
  currency: string;
  vendor?: string;
  giftType: GiftType;
  status: GiftStatus;
  reasoning: string;
};

type TierTemplate = {
  title: string;
  description: string;
  category: GiftCategory;
  giftType: GiftType;
  vendor: string;
  reasoning: string;
  cost: number;
};

type CatalogEntry = Record<AccountTier, TierTemplate>;

// ── Gift catalog: category × tier → template ──────────────────────────────
const CATALOG: Record<InterestCategory, CatalogEntry> = {
  FITNESS: {
    STRATEGIC: {
      title: "WHOOP 4.0 Annual Membership + Performance Kit",
      description:
        "12-month WHOOP membership with personalized recovery and strain analytics, plus a branded performance wear package.",
      category: "SUBSCRIPTION",
      giftType: "VIRTUAL",
      vendor: "WHOOP",
      reasoning:
        "WHOOP's elite biometric tracking aligns with their passion for performance and data-driven improvement.",
      cost: 480,
    },
    ENTERPRISE: {
      title: "Garmin Forerunner 965 GPS Watch",
      description:
        "Premium GPS multisport watch with advanced training metrics and a 3-month Garmin Connect Premium subscription.",
      category: "PHYSICAL_PRODUCT",
      giftType: "PHYSICAL",
      vendor: "Garmin",
      reasoning:
        "Professional-grade GPS tracking elevates their training with metrics they'll actually use.",
      cost: 190,
    },
    MID_MARKET: {
      title: "Premium Running & Recovery Bundle",
      description:
        "Brooks Glycerin 21 gift card ($60), foam roller, and compression sleeves — everything for the serious runner.",
      category: "PHYSICAL_PRODUCT",
      giftType: "PHYSICAL",
      vendor: "Brooks Running",
      reasoning:
        "Quality running essentials tailored to their active lifestyle without overspending.",
      cost: 85,
    },
  },

  MUSIC: {
    STRATEGIC: {
      title: "VIP Concert Experience",
      description:
        "Premium tickets to a sold-out show in their city with VIP hospitality access and an artist meet-and-greet.",
      category: "EXPERIENCE",
      giftType: "EXPERIENCE",
      vendor: "Live Nation Premium",
      reasoning:
        "A once-in-a-career live music moment creates a memory tied directly to their passion.",
      cost: 450,
    },
    ENTERPRISE: {
      title: "Sonos Era 300 Spatial Audio Speaker",
      description:
        "Premium wireless speaker with Dolby Atmos Music and spatial audio, ideal for home listening sessions.",
      category: "PHYSICAL_PRODUCT",
      giftType: "PHYSICAL",
      vendor: "Sonos",
      reasoning:
        "Premium audio hardware for a music enthusiast who appreciates high-fidelity sound.",
      cost: 150,
    },
    MID_MARKET: {
      title: "Vinyl Me Please Subscription (3 Months)",
      description:
        "Curated vinyl record subscription — 2 hand-picked LPs monthly tailored to their genre preferences.",
      category: "SUBSCRIPTION",
      giftType: "PHYSICAL",
      vendor: "Vinyl Me Please",
      reasoning:
        "Personalized vinyl curation for a music lover who appreciates the analog experience.",
      cost: 75,
    },
  },

  SPORTS: {
    STRATEGIC: {
      title: "Premium Sports Experience Package",
      description:
        "Club-level seats to a playoff game (NBA/NFL/MLB based on preference) with VIP hospitality, parking, and a merchandise credit.",
      category: "EVENT",
      giftType: "EXPERIENCE",
      vendor: "SportsEvents360",
      reasoning:
        "A premium live sports experience matches their team passion and creates a standout memory.",
      cost: 500,
    },
    ENTERPRISE: {
      title: "Signed Memorabilia + Premium Seats",
      description:
        "Authenticated signed memorabilia from their favorite team alongside a pair of premium-section game tickets.",
      category: "MERCHANDISE",
      giftType: "PHYSICAL",
      vendor: "Fanatics Authentic",
      reasoning:
        "Authentic memorabilia celebrates their team loyalty in a tangible, display-worthy way.",
      cost: 180,
    },
    MID_MARKET: {
      title: "Sports Streaming Annual Bundle",
      description:
        "12-month ESPN+ or NBA League Pass subscription with a branded team merchandise item.",
      category: "SUBSCRIPTION",
      giftType: "VIRTUAL",
      vendor: "ESPN+ / NBA League Pass",
      reasoning:
        "Never miss a game with a premium streaming subscription for their favorite sport.",
      cost: 80,
    },
  },

  TRAVEL: {
    STRATEGIC: {
      title: "Luxury Weekend Getaway",
      description:
        "Two-night stay at a 5-star boutique hotel in a city of their choice, including breakfast and spa credit.",
      category: "EXPERIENCE",
      giftType: "EXPERIENCE",
      vendor: "Tablet Hotels",
      reasoning:
        "A curated luxury travel experience directly aligns with their passion for discovering new places.",
      cost: 490,
    },
    ENTERPRISE: {
      title: "Away Carry-On + Medium Luggage Set",
      description:
        "The Carry-On and The Medium in hardshell polycarbonate with TSA-approved locks and a lifetime warranty.",
      category: "PHYSICAL_PRODUCT",
      giftType: "PHYSICAL",
      vendor: "Away",
      reasoning:
        "Premium travel gear for a frequent traveler who values smart, durable design.",
      cost: 195,
    },
    MID_MARKET: {
      title: "Premium Travel Accessories Bundle",
      description:
        "Bose QuietComfort earbuds, Cabeau Evolution pillow, packing cubes, and a universal travel adapter.",
      category: "PHYSICAL_PRODUCT",
      giftType: "PHYSICAL",
      vendor: "Bose / Cabeau",
      reasoning:
        "Practical, high-quality accessories that make every journey more comfortable.",
      cost: 90,
    },
  },

  FAMILY: {
    STRATEGIC: {
      title: "Luxury Family Day Experience",
      description:
        "VIP theme park experience for a family of 4 with private guide, front-of-line access, reserved dining, and cabana.",
      category: "EXPERIENCE",
      giftType: "EXPERIENCE",
      vendor: "Universal VIP / Disney VIP",
      reasoning:
        "Creating an unforgettable family memory reflects what matters most to them beyond work.",
      cost: 480,
    },
    ENTERPRISE: {
      title: "Professional Family Portrait Session",
      description:
        "In-home photo session with a professional photographer — 20 fully edited digital images and one framed print.",
      category: "EXPERIENCE",
      giftType: "EXPERIENCE",
      vendor: "Shoott",
      reasoning:
        "A professional family portrait captures a precious moment in a meaningful, lasting format.",
      cost: 160,
    },
    MID_MARKET: {
      title: "Premium Family Game Night Bundle",
      description:
        "Curated selection of 3 top-rated board games matched to the ages of their children.",
      category: "PHYSICAL_PRODUCT",
      giftType: "PHYSICAL",
      vendor: "Target / Board Game Selection",
      reasoning:
        "Quality family games that bring everyone together for the moments they treasure most.",
      cost: 75,
    },
  },

  FOOD: {
    STRATEGIC: {
      title: "Michelin Chef's Table Experience",
      description:
        "Private tasting menu for 2 at a Michelin-starred restaurant with paired wines and an exclusive kitchen tour.",
      category: "EXPERIENCE",
      giftType: "EXPERIENCE",
      vendor: "Resy / OpenTable Concierge",
      reasoning:
        "An exclusive top-tier culinary experience for a genuine food connoisseur who appreciates the craft.",
      cost: 500,
    },
    ENTERPRISE: {
      title: "Sommelier Wine Box Subscription (3 Months)",
      description:
        "Quarterly curated case of 12 premium wines with detailed tasting notes and food pairing guide.",
      category: "SUBSCRIPTION",
      giftType: "PHYSICAL",
      vendor: "Vivino / Naked Wines",
      reasoning:
        "A premium wine subscription delivers discovery and pleasure to someone who takes wine seriously.",
      cost: 150,
    },
    MID_MARKET: {
      title: "Specialty Coffee Subscription (3 Months)",
      description:
        "Bi-weekly delivery of single-origin specialty coffee from top-rated roasters around the world.",
      category: "SUBSCRIPTION",
      giftType: "PHYSICAL",
      vendor: "Trade Coffee",
      reasoning:
        "A daily moment of delight for the coffee-obsessed professional — every morning, sourced globally.",
      cost: 80,
    },
  },

  BOOKS: {
    STRATEGIC: {
      title: "Curated Reading Package + Kindle Scribe",
      description:
        "6-month personalized book subscription (2 books/month), premium leather journal, and Amazon Kindle Scribe.",
      category: "SUBSCRIPTION",
      giftType: "PHYSICAL",
      vendor: "Literati / Amazon",
      reasoning:
        "A complete reading upgrade for a voracious reader who values intellectual growth and reflection.",
      cost: 450,
    },
    ENTERPRISE: {
      title: "Kindle Paperwhite + 6-Month Kindle Unlimited",
      description:
        "Kindle Paperwhite (16GB, waterproof) with 6-month Kindle Unlimited access and a curated reading list.",
      category: "PHYSICAL_PRODUCT",
      giftType: "PHYSICAL",
      vendor: "Amazon",
      reasoning:
        "Premium e-reader with an unlimited library enhances their reading habit wherever they are.",
      cost: 165,
    },
    MID_MARKET: {
      title: "Book of the Month (3-Month Subscription)",
      description:
        "3-month BOTM membership with early-access selections across fiction, business, and nonfiction genres.",
      category: "SUBSCRIPTION",
      giftType: "PHYSICAL",
      vendor: "Book of the Month",
      reasoning:
        "Curated monthly picks feed their reading habit with exciting new titles hand-selected by editors.",
      cost: 75,
    },
  },

  TECH: {
    STRATEGIC: {
      title: "Apple AirPods Max + Apple Watch Ultra 2",
      description:
        "AirPods Max with spatial audio and active noise cancellation paired with Apple Watch Ultra 2 for the connected professional.",
      category: "PHYSICAL_PRODUCT",
      giftType: "PHYSICAL",
      vendor: "Apple",
      reasoning:
        "Best-in-class Apple wearables for a tech leader who lives on the cutting edge of connected hardware.",
      cost: 490,
    },
    ENTERPRISE: {
      title: "AirPods Pro (2nd Gen) + MagSafe Ecosystem Bundle",
      description:
        "Latest AirPods Pro with H2 chip plus a MagSafe charger bundle — seamless Apple ecosystem upgrade.",
      category: "PHYSICAL_PRODUCT",
      giftType: "PHYSICAL",
      vendor: "Apple",
      reasoning:
        "Premium wireless audio and charging that integrate perfectly with their existing Apple workflow.",
      cost: 160,
    },
    MID_MARKET: {
      title: "Tech Accessories Gift Card",
      description:
        "$80 Best Buy gift card to spend on the gadget or accessory of their choice.",
      category: "GIFT_CARD",
      giftType: "VIRTUAL",
      vendor: "Best Buy",
      reasoning:
        "Maximum flexibility for a gadget enthusiast to choose their own upgrade.",
      cost: 80,
    },
  },

  GAMING: {
    STRATEGIC: {
      title: "PlayStation 5 Pro + 1-Year PS Plus Extra",
      description:
        "PS5 Pro console bundle with 3 top-rated games, a premium headset, and a 12-month PS Plus Extra subscription.",
      category: "PHYSICAL_PRODUCT",
      giftType: "PHYSICAL",
      vendor: "PlayStation",
      reasoning:
        "The ultimate gaming setup for a passionate gamer who deserves top-tier hardware.",
      cost: 500,
    },
    ENTERPRISE: {
      title: "Secretlab Titan Chair + SteelSeries Headset",
      description:
        "Secretlab Titan Evo gaming chair with SteelSeries Arctis Nova Pro wireless headset for the serious gamer.",
      category: "PHYSICAL_PRODUCT",
      giftType: "PHYSICAL",
      vendor: "Secretlab / SteelSeries",
      reasoning:
        "A premium ergonomic setup upgrade for a dedicated gamer who spends real time in the chair.",
      cost: 180,
    },
    MID_MARKET: {
      title: "Xbox Game Pass Ultimate (12 Months)",
      description:
        "12-month Xbox Game Pass Ultimate with access to 100+ games across console, PC, and cloud streaming.",
      category: "SUBSCRIPTION",
      giftType: "VIRTUAL",
      vendor: "Microsoft",
      reasoning:
        "An unlimited gaming library gives an avid gamer hundreds of hours of content.",
      cost: 80,
    },
  },

  ART: {
    STRATEGIC: {
      title: "Private Museum After-Hours Experience",
      description:
        "Private after-hours guided gallery tour at a premier museum with curator, dinner pairing, and artist introduction.",
      category: "EXPERIENCE",
      giftType: "EXPERIENCE",
      vendor: "MoMA / LACMA Private Events",
      reasoning:
        "An exclusive art world experience for someone who lives and breathes cultural immersion.",
      cost: 480,
    },
    ENTERPRISE: {
      title: "Commissioned Original Artwork",
      description:
        "A commissioned 12×16\" piece from a rising local artist in their preferred style, professionally framed.",
      category: "PHYSICAL_PRODUCT",
      giftType: "PHYSICAL",
      vendor: "Artsy / Local Artist Commission",
      reasoning:
        "A one-of-a-kind commission connects their love of art to something deeply personal.",
      cost: 180,
    },
    MID_MARKET: {
      title: "Fine Art Print Subscription (3 Months)",
      description:
        "Quarterly museum-quality prints from curated emerging artists, delivered ready to frame.",
      category: "SUBSCRIPTION",
      giftType: "PHYSICAL",
      vendor: "Artfinder",
      reasoning:
        "Curated art delivered quarterly to build their collection and beautify their space.",
      cost: 75,
    },
  },

  UNKNOWN: {
    STRATEGIC: {
      title: "Mastercard Luxury Gift Card",
      description: "$500 Mastercard prepaid gift card — maximum flexibility for a valued relationship.",
      category: "GIFT_CARD",
      giftType: "VIRTUAL",
      vendor: "Mastercard",
      reasoning: "When interests are unclear, giving them the freedom to choose is the most respectful gesture.",
      cost: 500,
    },
    ENTERPRISE: {
      title: "Mastercard Premium Gift Card",
      description: "$200 Mastercard prepaid gift card — a thoughtful and flexible gesture.",
      category: "GIFT_CARD",
      giftType: "VIRTUAL",
      vendor: "Mastercard",
      reasoning: "When interests are unclear, giving them the freedom to choose is the most respectful gesture.",
      cost: 200,
    },
    MID_MARKET: {
      title: "Mastercard Gift Card",
      description: "$75 Mastercard prepaid gift card — a practical token of appreciation.",
      category: "GIFT_CARD",
      giftType: "VIRTUAL",
      vendor: "Mastercard",
      reasoning: "When interests are unclear, giving them the freedom to choose is the most respectful gesture.",
      cost: 75,
    },
  },
};

// ── Main export ────────────────────────────────────────────────────────────

export function generateGifts(
  contactId: string,
  interests: Array<{ id: string; category: InterestCategory; confidence: number }>,
  tier: AccountTier
): GiftInput[] {
  if (interests.length === 0) {
    // Fallback to UNKNOWN gift
    const template = CATALOG.UNKNOWN[tier];
    return [
      {
        contactId,
        title: template.title,
        description: template.description,
        category: template.category,
        estimatedCost: template.cost,
        currency: "USD",
        vendor: template.vendor,
        giftType: template.giftType,
        status: "DRAFT",
        reasoning: template.reasoning,
      },
    ];
  }

  // Deduplicate: keep highest-confidence interest per category
  const bestByCategory = new Map<
    InterestCategory,
    (typeof interests)[number]
  >();
  for (const interest of interests) {
    const existing = bestByCategory.get(interest.category);
    if (!existing || interest.confidence > existing.confidence) {
      bestByCategory.set(interest.category, interest);
    }
  }

  // Take top 3 categories by confidence
  const topInterests = Array.from(bestByCategory.values())
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);

  return topInterests.map((interest) => {
    const entry = CATALOG[interest.category] ?? CATALOG.UNKNOWN;
    const template = entry[tier];
    return {
      contactId,
      interestId: interest.id,
      title: template.title,
      description: template.description,
      category: template.category,
      estimatedCost: template.cost,
      currency: "USD",
      vendor: template.vendor,
      giftType: template.giftType,
      status: "DRAFT",
      reasoning: `${template.reasoning} (Detected ${interest.category} interest with ${Math.round(interest.confidence * 100)}% confidence.)`,
    };
  });
}
