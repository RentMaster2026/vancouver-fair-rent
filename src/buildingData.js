// buildingData.js
// Known Vancouver rental buildings for the building-name autocomplete field
// and the building ranking pages.
//
// All FairRent Canada Building Scores are either:
//   - Computed from real renter submissions (when MIN_SUBS_FOR_SCORE or more exist)
//   - Shown as "Limited data" or "Early score" when data is thin
//
// Privacy thresholds:
//   MIN_SUBS_FOR_AVG   = 3  — minimum to show a grouped average
//   MIN_SUBS_FOR_SCORE = 5  — minimum to publish a building score
//   MIN_SUBS_FOR_MED   = 8  — medium confidence
//   MIN_SUBS_FOR_HIGH  = 20 — high confidence
//
// Schema note: the Supabase rent_submissions table needs a building_name text column
// before building-level aggregation works. Run:
//   ALTER TABLE rent_submissions ADD COLUMN building_name text;
// Then set BUILDING_COLUMN_READY = true in App.jsx.

export const MIN_SUBS_FOR_AVG   = 3;
export const MIN_SUBS_FOR_SCORE = 5;
export const MIN_SUBS_FOR_MED   = 8;
export const MIN_SUBS_FOR_HIGH  = 20;

// Property type labels
export const PROPERTY_TYPE_LABELS = {
  "purpose-built": "Purpose-built rental",
  "condo":         "Condo",
  "student":       "Student housing",
  "converted":     "Converted house",
  "townhouse":     "Townhouse",
  "other":         "Other",
};

// Transit access labels
export const TRANSIT_LABELS = {
  excellent: "Excellent transit",
  good:      "Good transit",
  fair:      "Some transit",
  limited:   "Limited transit",
};

// Known large rental buildings in Vancouver.
// Sources: publicly listed on Rentals.ca, Zumper, PadMapper, and Craigslist.
// All buildings are publicly known purpose-built or large condo rentals.
// Used for the building-name autocomplete field in the submission form.
export const VANCOUVER_BUILDINGS = [

  // Downtown Vancouver
  {
    id: "1188-pinetree",
    name: "1188 Pinetree",
    address: "1188 Pinetree Way",
    neighbourhood: "downtown",
    type: "condo",
    amenities: ["elevator", "gym", "pool", "concierge", "parking"],
    transit: "excellent",
    note: "Downtown condo-rental high-rise.",
  },
  {
    id: "1283-howe",
    name: "1283 Howe",
    address: "1283 Howe Street",
    neighbourhood: "downtown",
    type: "condo",
    amenities: ["elevator", "gym", "concierge", "parking", "pet-friendly"],
    transit: "excellent",
    note: "Newer Yaletown-adjacent condo tower.",
  },
  {
    id: "1188-richards",
    name: "Donovan",
    address: "1133 Hornby Street",
    neighbourhood: "downtown",
    type: "condo",
    amenities: ["elevator", "gym", "concierge", "parking"],
    transit: "excellent",
    note: "Modern Hornby tower near downtown core.",
  },

  // Yaletown
  {
    id: "1500-hornby",
    name: "1500 Hornby",
    address: "1500 Hornby Street",
    neighbourhood: "yaletown",
    type: "condo",
    amenities: ["elevator", "gym", "pool", "concierge", "parking"],
    transit: "excellent",
    note: "Yaletown condo-rental near False Creek.",
  },
  {
    id: "888-pacific",
    name: "888 Pacific",
    address: "888 Pacific Street",
    neighbourhood: "yaletown",
    type: "condo",
    amenities: ["elevator", "gym", "pool", "concierge", "parking", "storage"],
    transit: "excellent",
    note: "Pacific Promenade - Yaletown waterfront tower.",
  },
  {
    id: "989-beatty",
    name: "989 Beatty",
    address: "989 Beatty Street",
    neighbourhood: "yaletown",
    type: "condo",
    amenities: ["elevator", "gym", "concierge", "parking"],
    transit: "excellent",
    note: "Yaletown condo-rental steps from the Roundhouse SkyTrain.",
  },

  // Coal Harbour
  {
    id: "1077-marinaside",
    name: "1077 Marinaside",
    address: "1077 Marinaside Crescent",
    neighbourhood: "coalharbour",
    type: "condo",
    amenities: ["elevator", "gym", "pool", "concierge", "parking", "pet-friendly"],
    transit: "good",
    note: "Marinaside waterfront condo-rental complex.",
  },
  {
    id: "323-jervis",
    name: "323 Jervis",
    address: "323 Jervis Street",
    neighbourhood: "coalharbour",
    type: "condo",
    amenities: ["elevator", "gym", "concierge", "parking", "storage"],
    transit: "good",
    note: "Escala - Coal Harbour high-rise with mountain views.",
  },
  {
    id: "1499-pender",
    name: "1499 Pender",
    address: "1499 West Pender Street",
    neighbourhood: "coalharbour",
    type: "condo",
    amenities: ["elevator", "gym", "pool", "concierge", "parking"],
    transit: "good",
    note: "Coal Harbour tower walking distance to Stanley Park.",
  },

  // West End
  {
    id: "1330-burnaby-st",
    name: "1330 Burnaby Street",
    address: "1330 Burnaby Street",
    neighbourhood: "westend",
    type: "purpose-built",
    amenities: ["elevator", "laundry", "parking"],
    transit: "good",
    note: "Classic West End rent-controlled apartment building.",
  },
  {
    id: "1525-pendrell",
    name: "1525 Pendrell",
    address: "1525 Pendrell Street",
    neighbourhood: "westend",
    type: "purpose-built",
    amenities: ["elevator", "laundry", "parking"],
    transit: "good",
    note: "Quiet West End mid-rise near Davie Village.",
  },
  {
    id: "1100-harwood",
    name: "1100 Harwood",
    address: "1100 Harwood Street",
    neighbourhood: "westend",
    type: "purpose-built",
    amenities: ["elevator", "laundry", "parking"],
    transit: "good",
    note: "English Bay rental close to the seawall.",
  },

  // Kitsilano
  {
    id: "2233-cornwall",
    name: "2233 Cornwall",
    address: "2233 Cornwall Avenue",
    neighbourhood: "kitsilano",
    type: "purpose-built",
    amenities: ["elevator", "laundry", "parking"],
    transit: "good",
    note: "Beachside Kits walk-up close to Kits Beach.",
  },
  {
    id: "1850-west-4th",
    name: "1850 West 4th",
    address: "1850 West 4th Avenue",
    neighbourhood: "kitsilano",
    type: "purpose-built",
    amenities: ["elevator", "laundry"],
    transit: "good",
    note: "Kitsilano mid-rise on the West 4th shopping strip.",
  },

  // Mount Pleasant
  {
    id: "3290-main",
    name: "3290 Main",
    address: "3290 Main Street",
    neighbourhood: "mountpleasant",
    type: "purpose-built",
    amenities: ["elevator", "laundry", "parking", "pet-friendly"],
    transit: "good",
    note: "Newer Mount Pleasant purpose-built on the Main Street strip.",
  },
  {
    id: "180-east-2nd",
    name: "180 East 2nd",
    address: "180 East 2nd Avenue",
    neighbourhood: "mountpleasant",
    type: "purpose-built",
    amenities: ["elevator", "gym", "parking"],
    transit: "excellent",
    note: "Mid-rise close to the future Broadway-Mount Pleasant SkyTrain station.",
  },

  // Commercial Drive / Grandview-Woodland
  {
    id: "1755-commercial",
    name: "1755 Commercial",
    address: "1755 Commercial Drive",
    neighbourhood: "commercialdrive",
    type: "purpose-built",
    amenities: ["elevator", "laundry", "parking"],
    transit: "excellent",
    note: "Commercial Drive walk-up near Broadway SkyTrain.",
  },
  {
    id: "1820-east-1st",
    name: "1820 East 1st",
    address: "1820 East 1st Avenue",
    neighbourhood: "grandviewwoodland",
    type: "purpose-built",
    amenities: ["elevator", "laundry", "parking"],
    transit: "good",
    note: "Grandview-Woodland low-rise off Commercial Drive.",
  },

  // Fairview
  {
    id: "1200-west-broadway",
    name: "1200 West Broadway",
    address: "1200 West Broadway",
    neighbourhood: "fairview",
    type: "purpose-built",
    amenities: ["elevator", "gym", "laundry", "parking"],
    transit: "excellent",
    note: "Fairview mid-rise close to VGH.",
  },
  {
    id: "1075-west-10th",
    name: "1075 West 10th",
    address: "1075 West 10th Avenue",
    neighbourhood: "fairview",
    type: "purpose-built",
    amenities: ["elevator", "laundry", "parking"],
    transit: "good",
    note: "Quiet Fairview rental block near Granville.",
  },

  // Gastown
  {
    id: "189-keefer",
    name: "189 Keefer",
    address: "189 Keefer Street",
    neighbourhood: "gastown",
    type: "condo",
    amenities: ["elevator", "gym", "parking"],
    transit: "excellent",
    note: "Gastown loft-style condo-rental in heritage building.",
  },
  {
    id: "33-w-pender",
    name: "33 West Pender",
    address: "33 West Pender Street",
    neighbourhood: "gastown",
    type: "condo",
    amenities: ["elevator", "concierge", "parking"],
    transit: "excellent",
    note: "Woodward's Tower - heritage redevelopment condo-rental.",
  },

  // Chinatown
  {
    id: "188-keefer",
    name: "188 Keefer",
    address: "188 Keefer Street",
    neighbourhood: "chinatown",
    type: "condo",
    amenities: ["elevator", "gym", "concierge", "parking"],
    transit: "excellent",
    note: "Newer Chinatown condo-rental tower.",
  },

  // Main Street
  {
    id: "4080-main",
    name: "4080 Main",
    address: "4080 Main Street",
    neighbourhood: "mainstreet",
    type: "purpose-built",
    amenities: ["elevator", "laundry", "parking", "pet-friendly"],
    transit: "good",
    note: "Riley Park-area rental on the Main Street corridor.",
  },

  // South Granville
  {
    id: "1485-west-13th",
    name: "1485 West 13th",
    address: "1485 West 13th Avenue",
    neighbourhood: "southgranville",
    type: "purpose-built",
    amenities: ["elevator", "laundry", "parking"],
    transit: "good",
    note: "South Granville rental near the design district.",
  },

  // Kerrisdale
  {
    id: "5790-east-blvd",
    name: "5790 East Boulevard",
    address: "5790 East Boulevard",
    neighbourhood: "kerrisdale",
    type: "purpose-built",
    amenities: ["elevator", "laundry", "parking"],
    transit: "fair",
    note: "Quiet Kerrisdale low-rise near 41st Avenue.",
  },

  // Dunbar
  {
    id: "5570-dunbar",
    name: "5570 Dunbar",
    address: "5570 Dunbar Street",
    neighbourhood: "dunbar",
    type: "purpose-built",
    amenities: ["elevator", "laundry", "parking"],
    transit: "fair",
    note: "Dunbar mid-rise near UBC bus corridor.",
  },

  // Strathcona
  {
    id: "955-east-hastings",
    name: "955 East Hastings",
    address: "955 East Hastings Street",
    neighbourhood: "strathcona",
    type: "purpose-built",
    amenities: ["elevator", "laundry", "parking"],
    transit: "good",
    note: "Strathcona purpose-built rental.",
  },

  // North Vancouver
  {
    id: "150-east-13th",
    name: "150 East 13th",
    address: "150 East 13th Street",
    neighbourhood: "northvancouver",
    type: "purpose-built",
    amenities: ["elevator", "gym", "laundry", "parking", "pet-friendly"],
    transit: "good",
    note: "Newer Lonsdale corridor rental in North Vancouver.",
  },
  {
    id: "131-east-3rd",
    name: "131 East 3rd",
    address: "131 East 3rd Street",
    neighbourhood: "northvancouver",
    type: "purpose-built",
    amenities: ["elevator", "laundry", "parking"],
    transit: "good",
    note: "Lower Lonsdale rental close to the SeaBus.",
  },

  // Burnaby
  {
    id: "4400-buchanan",
    name: "Sovereign at Brentwood",
    address: "4400 Buchanan Street",
    neighbourhood: "burnaby",
    type: "condo",
    amenities: ["elevator", "gym", "pool", "concierge", "parking", "pet-friendly"],
    transit: "excellent",
    note: "Brentwood Town Centre condo-rental tower.",
  },
  {
    id: "4730-kingsway",
    name: "Metrotown Place",
    address: "4730 Kingsway",
    neighbourhood: "burnaby",
    type: "condo",
    amenities: ["elevator", "gym", "concierge", "parking"],
    transit: "excellent",
    note: "Metrotown high-rise close to SkyTrain.",
  },

  // Richmond
  {
    id: "7080-no-3-rd",
    name: "7080 No. 3 Road",
    address: "7080 No. 3 Road",
    neighbourhood: "richmond",
    type: "condo",
    amenities: ["elevator", "gym", "pool", "concierge", "parking"],
    transit: "excellent",
    note: "Richmond Centre condo-rental near Brighouse Canada Line.",
  },
  {
    id: "5111-garden-city",
    name: "5111 Garden City",
    address: "5111 Garden City Road",
    neighbourhood: "richmond",
    type: "condo",
    amenities: ["elevator", "gym", "parking"],
    transit: "good",
    note: "Richmond mid-rise close to Lansdowne SkyTrain.",
  },

  // New Westminster
  {
    id: "888-carnarvon",
    name: "888 Carnarvon",
    address: "888 Carnarvon Street",
    neighbourhood: "newwestminster",
    type: "condo",
    amenities: ["elevator", "gym", "pool", "concierge", "parking"],
    transit: "excellent",
    note: "Plaza 88 - New Westminster condo-rental over the SkyTrain.",
  },
  {
    id: "39-sixth",
    name: "39 Sixth Street",
    address: "39 Sixth Street",
    neighbourhood: "newwestminster",
    type: "purpose-built",
    amenities: ["elevator", "laundry", "parking"],
    transit: "excellent",
    note: "Older New West rental close to Columbia SkyTrain.",
  },

];

// Get buildings for a specific neighbourhood key (matches hoodData.js keys)
export function getBuildingsForHood(hoodKey) {
  return VANCOUVER_BUILDINGS.filter(b => b.neighbourhood === hoodKey);
}

// Get buildings matching a neighbourhood name (from the dropdown value, e.g. "Kitsilano").
// Returns empty array when no neighbourhood is selected to keep the dropdown clean.
// Returns all buildings with matching neighbourhood when one is selected.
export function getBuildingsForHoodName(hoodName) {
  if (!hoodName) return [];
  const match = HOOD_NAME_TO_KEY[hoodName] ?? null;
  if (!match) return [];
  return VANCOUVER_BUILDINGS.filter(b => b.neighbourhood === match);
}

// Maps the neighbourhood dropdown value (e.g. "Kitsilano") to the hood key
// used in buildingData (e.g. "kitsilano").
// These match the keys in VANCOUVER_HOODS from hoodData.js.
export const HOOD_NAME_TO_KEY = {
  "Burnaby":                  "burnaby",
  "Chinatown":                "chinatown",
  "Coal Harbour":             "coalharbour",
  "Commercial Drive":         "commercialdrive",
  "Downtown Vancouver":       "downtown",
  "Dunbar":                   "dunbar",
  "Fairview":                 "fairview",
  "Gastown":                  "gastown",
  "Grandview-Woodland":       "grandviewwoodland",
  "Kerrisdale":               "kerrisdale",
  "Kitsilano":                "kitsilano",
  "Main Street":              "mainstreet",
  "Mount Pleasant":           "mountpleasant",
  "New Westminster":          "newwestminster",
  "North Vancouver":          "northvancouver",
  "Richmond":                 "richmond",
  "South Granville":          "southgranville",
  "Strathcona":               "strathcona",
  "West End":                 "westend",
  "Yaletown":                 "yaletown",
};

// Resolve the building name that should be stored in the submission.
// buildingMode: building id (from VANCOUVER_BUILDINGS), "other", "skip", or ""
// buildingText: free-text value when mode is "other"
export function resolveBuildingName(buildingMode, buildingText) {
  if (!buildingMode || buildingMode === "skip") return null;
  if (buildingMode === "other") return (buildingText || "").trim() || null;
  const found = VANCOUVER_BUILDINGS.find(b => b.id === buildingMode);
  return found ? `${found.name} - ${found.address}` : null;
}

// ─── Building Score Engine ────────────────────────────────────────────────────
//
// FairRent Canada Building Score is out of 100.
// Categories and weights:
//   1. Rent fairness          35 pts
//   2. Value for location     15 pts
//   3. Building features      15 pts
//   4. Market competitiveness 15 pts
//   5. Renter data confidence 10 pts
//   6. Affordability pressure 10 pts

export function calcBuildingScore({ building, submissions, cityBaseBedroom, hoodMult }) {
  const n = submissions.length;
  if (n < MIN_SUBS_FOR_SCORE) return null;

  const rents   = submissions.map(s => s.monthly_rent);
  const avgRent = rents.reduce((a, b) => a + b, 0) / rents.length;
  const bench   = Math.round(cityBaseBedroom * hoodMult);
  const ratio   = avgRent / bench;

  // 1. Rent fairness (35 pts)
  // Does not punish expensive buildings if they're fair vs similar luxury comps.
  // A building scoring high here pays fair rent for its type and neighbourhood.
  let rentFairness;
  if      (ratio <= 0.85) rentFairness = 35;
  else if (ratio <= 0.95) rentFairness = 30;
  else if (ratio <= 1.05) rentFairness = 24;
  else if (ratio <= 1.15) rentFairness = 16;
  else if (ratio <= 1.30) rentFairness = 9;
  else                    rentFairness = 4;

  // 2. Value for location (15 pts)
  const transitPts = { excellent: 15, good: 11, fair: 7, limited: 3 };
  const locationValue = transitPts[building.transit] ?? 8;

  // 3. Building features and amenities (15 pts)
  const amenPts = {
    elevator: 2, gym: 2, pool: 2, concierge: 2, parking: 2,
    laundry: 1, balcony: 1, storage: 1, "pet-friendly": 1, ac: 1,
  };
  const featuresScore = Math.min(15,
    (building.amenities || []).reduce((sum, a) => sum + (amenPts[a] ?? 0), 0)
  );

  // 4. Market competitiveness (15 pts)
  let marketComp;
  if      (ratio <= 0.90) marketComp = 15;
  else if (ratio <= 1.00) marketComp = 12;
  else if (ratio <= 1.10) marketComp = 8;
  else if (ratio <= 1.20) marketComp = 4;
  else                    marketComp = 2;

  // 5. Renter data confidence (10 pts)
  let confidence;
  if      (n >= MIN_SUBS_FOR_HIGH) confidence = 10;
  else if (n >= MIN_SUBS_FOR_MED)  confidence = 8;
  else if (n >= MIN_SUBS_FOR_SCORE)confidence = 5;
  else                             confidence = 2;

  // 6. Affordability pressure (10 pts)
  // Looks at whether the building is accessible for typical renter budgets.
  let affordability;
  if      (ratio <= 0.85) affordability = 10;
  else if (ratio <= 0.95) affordability = 8;
  else if (ratio <= 1.05) affordability = 6;
  else if (ratio <= 1.15) affordability = 4;
  else                    affordability = 2;

  const total = Math.min(100, Math.max(0,
    rentFairness + locationValue + featuresScore + marketComp + confidence + affordability
  ));

  return {
    total: Math.round(total),
    breakdown: { rentFairness, locationValue, featuresScore, marketComp, confidence, affordability },
    avgRent: Math.round(avgRent),
    bench,
    rentRatio: ratio,
    submissions: n,
  };
}

// Score label for a building total score (out of 100)
export function getBuildingScoreLabel(score) {
  if (score >= 90) return { label: "Strong value",    color: "#1a5c34", bg: "#f0f7f2", border: "#a8d5b5" };
  if (score >= 80) return { label: "Good value",      color: "#1a5c34", bg: "#f0f7f2", border: "#a8d5b5" };
  if (score >= 70) return { label: "Fair - watch the price", color: "#7a4f00", bg: "#fdf8f0", border: "#e8c97a" };
  if (score >= 60) return { label: "Expensive vs. similar", color: "#b45309", bg: "#fffbeb", border: "#fde68a" };
  return               { label: "Limited value (early data)", color: "#8b1a1a", bg: "#fdf0f0", border: "#e8a8a8" };
}

// Confidence label for a building based on submission count
export function getBuildingConfidence(n) {
  if (n >= MIN_SUBS_FOR_HIGH)  return { label: "High confidence",   dot: "#1a5c34", text: "#1a5c34" };
  if (n >= MIN_SUBS_FOR_MED)   return { label: "Medium confidence", dot: "#7a4f00", text: "#7a4f00" };
  if (n >= MIN_SUBS_FOR_SCORE) return { label: "Low confidence",    dot: "#8b1a1a", text: "#8b1a1a" };
  if (n >= MIN_SUBS_FOR_AVG)   return { label: "Early score",       dot: "#9aa4af", text: "#6a7682" };
  return                              { label: "Limited data",       dot: "#9aa4af", text: "#6a7682" };
}
