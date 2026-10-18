import fs from "node:fs";

const API = "https://rentall.runasp.net";
const TOKEN = fs.readFileSync("C:/Users/VIP/AppData/Local/Temp/opencode/seed3-token.txt", "utf8").trim();

const H = {
  Authorization: `Bearer ${TOKEN}`,
  Accept: "application/json",
  "Accept-Language": "en",
  "X-Locale": "en",
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** rentall.runasp.net intermittently drops the TLS connect — retry with backoff. */
async function raw(path, { method = "GET", body, headers = {} } = {}) {
  let res;
  for (let i = 1; i <= 10; i++) {
    try {
      res = await fetch(`${API}${path}`, { method, headers: { ...H, ...headers }, body });
      if (res.status !== 502 && res.status !== 503) break;
    } catch {
      /* fall through to retry */
    }
    if (i === 10) throw new Error(`${method} ${path} network failure`);
    console.log(`      .. retry ${i}/10`);
    await sleep(i * 1500);
  }
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = null; }
  if (!res.ok || (json && json.isSuccess === false)) {
    const e = json?.errors;
    const detail = Array.isArray(e) ? e.join("; ")
      : e && typeof e === "object" ? Object.entries(e).map(([k, v]) => `${k}: ${v}`).join("; ")
      : null;
    throw new Error(`${method} ${path} -> ${res.status} ${String(json?.message || detail || text).slice(0, 300)}`);
  }
  return json;
}

const jsonPost = (payload) => ({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });

/**
 * Inconsistent envelope: most endpoints wrap in `{ data: ... }`, but
 * POST /api/properties/categories (and category-items) return the object bare.
 */
const unwrap = (res) => res?.data ?? res;

const T = (en) => ({ en, ar: en, fr: en, de: en, ru: en });

// ── Enums ─────────────────────────────────────────────────────────────────────
const PropertyType = { Apartment: 1, Villa: 2, Studio: 3, Chalet: 4, TwinHouse: 5, TownHouse: 6, Duplex: 7, Penthouse: 8, Cabin: 9, Hotel: 10, twoBedroom: 11, oneBedroom: 12 };
const PropertyStatus = { Clean: 1, Dirty: 2, Maintenance: 3 };
const BedType = { Single: 0, Twin: 1, Double: 2, Queen: 3, King: 4, SofaBed: 5, BunkBed: 6, BabyCrib: 7, Futon: 8 };

const LANDMARK_GROUP = "7814e11e-144e-4dfc-beca-a9bb304356b2";

// ── 1. Rent amenity categories ────────────────────────────────────────────────
const RENT_CATEGORIES = [
  { name: "General", icon: "amenities-general",
    items: ["Air Conditioner", "Internet", "Satellite TV", "Security System", "Washer", "Elevator", "Parking", "Garden"] },
  { name: "Bed and Bath", icon: "amenities-bedbath",
    items: ["Bed Linens", "Bath Towels", "Hair Dryer", "Hot Tub", "Shower", "Toiletries"] },
  { name: "Dining", icon: "amenities-dining",
    items: ["Coffee Maker", "Cooking Basics", "Dishwasher", "High Chair", "Microwave", "Refrigerator"] },
  { name: "Facilities", icon: "amenities-facilities",
    items: ["Bar / Restaurant", "Breakfast Included", "Family Friendly", "Free Parking", "Non Smoking", "Pets Allowed", "Pool", "Wheelchair Accessible"] },
];

async function ensureAmenityCategories() {
  const existing = await raw("/api/properties/categories?includeItems=true&onlyActive=false");
  const byName = new Map((existing?.data ?? []).map((c) => [String(c.name).toLowerCase(), c]));

  // displayOrder must be globally unique — the API 409s on a collision.
  const usedOrders = new Set((existing?.data ?? []).map((c) => Number(c.displayOrder)));
  let nextOrder = 1;
  const takeOrder = () => { while (usedOrders.has(nextOrder)) nextOrder++; usedOrders.add(nextOrder); return nextOrder; };

  const out = [];

  for (const def of RENT_CATEGORIES) {
    let cat = byName.get(def.name.toLowerCase());
    if (!cat) {
      const res = await raw("/api/properties/categories", jsonPost({
        name: T(def.name), icon: def.icon, defaultIcon: def.icon, displayOrder: takeOrder(),
      }));
      cat = unwrap(res);
      console.log(`  created category "${def.name}" -> ${cat.id}`);
    } else {
      console.log(`  reusing category "${def.name}" -> ${cat.id}`);
    }

    const have = new Map((cat.items ?? []).map((i) => [String(i.name).toLowerCase(), i]));
    const usedItemOrders = new Set((cat.items ?? []).map((i) => Number(i.displayOrder)));
    let nextItemOrder = 1;
    const itemIds = [];

    for (const itemName of def.items) {
      const found = have.get(itemName.toLowerCase());
      if (found) { itemIds.push(found.id); continue; }
      while (usedItemOrders.has(nextItemOrder)) nextItemOrder++;
      usedItemOrders.add(nextItemOrder);

      const res = await raw("/api/properties/category-items", jsonPost({
        propertyCategoryId: cat.id, name: T(itemName), displayOrder: nextItemOrder,
      }));
      itemIds.push(unwrap(res).id);
      console.log(`      + item "${itemName}"`);
    }
    out.push({ name: def.name, itemIds });
  }
  return out;
}

// ── 2. Landmarks ──────────────────────────────────────────────────────────────
const LANDMARKS = [
  { key: "Beach", value: "Private beach access" },
  { key: "Mall", value: "City Stars Mall" },
  { key: "Marina", value: "El Gouna Marina" },
  { key: "Airport", value: "Hurghada International Airport" },
  { key: "Hospital", value: "Hurghada University Hospital" },
  { key: "Promenade", value: "Marina promenade" },
];

async function ensureLandmarks() {
  const existing = await raw(`/api/attribute-group-items/group/${LANDMARK_GROUP}`);
  const have = new Map((existing?.data ?? []).map((l) => [String(l.key).toLowerCase(), l]));
  const used = new Set((existing?.data ?? []).map((l) => Number(l.displayOrder)));
  let next = 1;
  const ids = [];

  for (const lm of LANDMARKS) {
    const found = have.get(lm.key.toLowerCase());
    if (found) { ids.push(found.id); continue; }
    while (used.has(next)) next++;
    used.add(next);

    const res = await raw("/api/attribute-group-items", jsonPost({
      attributeGroupId: LANDMARK_GROUP,
      key: T(lm.key), value: T(lm.value), displayOrder: next,
    }));
    const item = unwrap(res);
    ids.push(item?.id);
    console.log(`  + landmark "${lm.key}" -> ${item?.id}`);
  }

  // POST silently drops `value` (lands as a placeholder like "2 K"), so repair
  // each one. This endpoint takes the fields at ROOT level with translation
  // objects — a `{ request: ... }` wrapper 400s.
  for (const lm of LANDMARKS) {
    const found = (await raw(`/api/attribute-group-items/group/${LANDMARK_GROUP}`))
      ?.data?.find((l) => String(l.key).toLowerCase() === lm.key.toLowerCase());
    if (!found || String(found.value) === lm.value) continue;
    await raw(`/api/attribute-group-items/${found.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attributeGroupId: LANDMARK_GROUP, key: T(lm.key), value: T(lm.value), displayOrder: found.displayOrder }),
    });
    console.log(`    fixed landmark "${lm.key}" value -> "${lm.value}"`);
  }

  return ids.filter(Boolean);
}

// ── 3. Properties ─────────────────────────────────────────────────────────────
const IMAGES = {
  apartment: [
    "public/single-property/gallery-main.png",
    "public/single-property/gallery-living.png",
    "public/single-property/gallery-kitchen.png",
    "public/single-property/gallery-bedroom.png",
    "public/homepage/properties/best-rental-1.png",
    "public/homepage/locations/sahl-hasheesh.jpg",
  ],
  villa: [
    "public/homepage/vacation/vacation-home-pool.jpeg",
    "public/single-property/gallery-main.png",
    "public/homepage/vacation/resort-pool-wide.jpeg",
    "public/single-property/gallery-living.png",
    "public/single-property/gallery-kitchen.png",
    "public/single-property/gallery-bedroom.png",
  ],
  studio: [
    "public/single-property/gallery-main.png",
    "public/single-property/gallery-living.png",
    "public/homepage/properties/best-rental-2.png",
    "public/single-property/gallery-kitchen.png",
    "public/homepage/locations/el-gouna.png",
  ],
};

const PROPS = [
  {
    code: "SB-1001",
    title: "Sea Breeze Apartment",
    desc: "A bright sea-facing apartment a short walk from the bay promenade. The open-plan living area opens onto a private balcony with uninterrupted views over the Red Sea, and the kitchen is fully equipped for longer stays.\n\nThe building has a shared rooftop pool, secure parking and a 24-hour concierge, making it an easy base for both a week of sun and a winter escape.",
    category: "Sahl Hasheesh",
    propertyType: PropertyType.Apartment,
    propertyStatus: PropertyStatus.Clean,
    bedroomNo: 2, bathroomNo: 2, roomNo: 3, capacity: 4, size: 120, basePrice: 85,
    isAvailable: true, isFeatured: true,
    hasSeaView: true, hasPoolView: true, hasGardenView: false, hasMountainView: false, hasCityView: false,
    latitude: 27.0408, longitude: 33.7534,
    rulesCancellation: "Free cancellation up to 5 days before check-in. After that, one night's stay is charged.",
    notes: "Owner lives onsite. Linen changed weekly on request.",
    sleepingArrangements: [
      { name: "Master Bedroom", displayOrder: 1, beds: [{ bedType: BedType.Queen, quantity: 1 }] },
      { name: "Second Bedroom", displayOrder: 2, beds: [{ bedType: BedType.Twin, quantity: 2 }] },
    ],
    listingDetails: {
      lateCheckIn: "Check-in after 20:00 available on request",
      outdoorFacility: T("Shared rooftop pool and sun terrace"),
      originalService: "Weekly linen change and housekeeping on request",
      cancellation: T("Free cancellation until 5 days before arrival."),
      extraPeopleFee: 0, extraPeople: "",
      privatebathroom: true,
      checkInHour: "14:00:00", checkOutHour: "12:00:00",
      familyFriendly: true, privateEntrance: false, listingStatus: 1,
    },
    amenityMix: [4, 3, 3, 4],
    landmarkCount: 3,
    images: IMAGES.apartment,
  },
  {
    code: "PG-2002",
    title: "Palm Garden Villa",
    desc: "A spacious villa set behind a wall of mature palms, with a shaded garden terrace and a private plunge pool. The ground floor is arranged around a large living room and dining area, with a fully fitted kitchen and a guest cloakroom.\n\nUpstairs are three bedrooms, the master with an en-suite bathroom and its own balcony over the garden. Air conditioning throughout, and parking for two cars inside the compound.",
    category: "El Fayrouz",
    propertyType: PropertyType.Villa,
    propertyStatus: PropertyStatus.Clean,
    bedroomNo: 3, bathroomNo: 3, roomNo: 4, capacity: 6, size: 210, basePrice: 160,
    isAvailable: true, isFeatured: true,
    hasSeaView: false, hasPoolView: true, hasGardenView: true, hasMountainView: true, hasCityView: false,
    latitude: 27.1917, longitude: 33.7264,
    rulesCancellation: "Free cancellation up to 7 days before check-in. Pets are not permitted.",
    notes: "Private plunge pool serviced weekly. Generator backup for power cuts.",
    sleepingArrangements: [
      { name: "Master Bedroom", displayOrder: 1, beds: [{ bedType: BedType.King, quantity: 1 }] },
      { name: "Second Bedroom", displayOrder: 2, beds: [{ bedType: BedType.Queen, quantity: 1 }] },
      { name: "Living Room", displayOrder: 3, beds: [{ bedType: BedType.SofaBed, quantity: 1 }] },
    ],
    listingDetails: {
      lateCheckIn: "Late arrivals welcome at any hour",
      outdoorFacility: T("Private plunge pool, palm garden and outdoor dining area"),
      originalService: "Pool and garden maintenance twice weekly",
      cancellation: T("Free cancellation until 7 days before arrival."),
      extraPeopleFee: 0, extraPeople: "",
      privatebathroom: true,
      checkInHour: "15:00:00", checkOutHour: "12:00:00",
      familyFriendly: true, privateEntrance: true, listingStatus: 1,
    },
    amenityMix: [5, 4, 4, 5],
    landmarkCount: 3,
    images: IMAGES.villa,
  },
  {
    code: "GM-3003",
    title: "El Gouna Marina Studio",
    desc: "A compact studio directly above the marina, with a balcony looking down over the yachts and the open sea beyond. Recently renovated with a new kitchen and bathroom, and fully furnished.\n\nEverything is walkable — the marina walk, the shops and restaurants of the old town, and the beach are all within a few minutes on foot.",
    category: "ElGona",
    propertyType: PropertyType.Studio,
    propertyStatus: PropertyStatus.Clean,
    bedroomNo: 1, bathroomNo: 1, roomNo: 1, capacity: 2, size: 55, basePrice: 45,
    isAvailable: true, isFeatured: false,
    hasSeaView: true, hasPoolView: false, hasGardenView: false, hasMountainView: false, hasCityView: true,
    latitude: 27.7383, longitude: 33.6847,
    rulesCancellation: "Free cancellation up to 3 days before check-in. Non-smoking property.",
    notes: "Non-smoking. No parties. Quiet hours after 22:00.",
    sleepingArrangements: [
      { name: "Studio", displayOrder: 1, beds: [{ bedType: BedType.Double, quantity: 1 }] },
    ],
    listingDetails: {
      lateCheckIn: "Self check-in available via lockbox after 20:00",
      outdoorFacility: T("Shared pool on the roof terrace"),
      originalService: "No housekeeping service during short stays",
      cancellation: T("Free cancellation until 3 days before arrival."),
      extraPeopleFee: 0, extraPeople: "",
      privatebathroom: true,
      checkInHour: "15:00:00", checkOutHour: "12:00:00",
      familyFriendly: false, privateEntrance: true, listingStatus: 1,
    },
    amenityMix: [3, 2, 2, 3],
    landmarkCount: 2,
    images: IMAGES.studio,
  },
];

async function seedProperty(def, locByName, amenityCats, landmarkIds) {
  const categoryId = locByName.get(def.category.toLowerCase());

  const payload = {
    categoryId,
    code: def.code,
    name: T(def.title),
    description: T(def.desc),
    bedroomNo: def.bedroomNo,
    bathroomNo: def.bathroomNo,
    roomNo: def.roomNo,
    capacity: def.capacity,
    size: def.size,
    basePrice: def.basePrice,
    propertyType: def.propertyType,
    propertyStatus: def.propertyStatus,
    isAvailable: def.isAvailable,
    isFeatured: def.isFeatured,
    hasSeaView: def.hasSeaView,
    hasPoolView: def.hasPoolView,
    hasGardenView: def.hasGardenView,
    hasMountainView: def.hasMountainView,
    hasCityView: def.hasCityView,
    latitude: def.latitude,
    longitude: def.longitude,
    rulesCancellation: def.rulesCancellation,
    notes: def.notes,
    address: {
      country: T("Egypt"),
      state: T("Red Sea"),
      city: T("Hurghada"),
      area: T(def.category),
      street: T(`${def.category} Road`),
      zipCode: "84511",
    },
    listingDetails: def.listingDetails,
    sleepingArrangements: def.sleepingArrangements,
    propertyCategoryItemIds: def.amenityMix.flatMap((n, i) => amenityCats[i]?.itemIds.slice(0, n) ?? []),
    attributeGroupItemIds: landmarkIds.slice(0, def.landmarkCount),
  };

  // Idempotent: skip if a property with this code already exists.
  // Page size is capped at 100 by the API.
  const list = await raw("/api/properties?pageNumber=1&pageSize=100");
  const existing = (list?.data?.items ?? []).find((p) => p.code === def.code);
  let id = existing?.id;
  let created = false;

  if (!id) {
    const res = await raw("/api/properties", jsonPost(payload));
    id = unwrap(res).id;
    created = true;
    console.log(`  created "${def.title}" -> ${id}`);
  } else {
    console.log(`  "${def.title}" exists -> ${id}`);
    // Re-assert the full payload so re-runs repair partial data.
    await raw(`/api/properties/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, id }),
    });
  }

  // ── Images ──────────────────────────────────────────────────────────────────
  const detail = await raw(`/api/properties/${id}`);
  const haveImages = (detail?.data?.images ?? []).length;

  if (!haveImages) {
    for (const rel of def.images) {
      const buf = fs.readFileSync(rel);
      const name = rel.split("/").pop();
      const type = name.endsWith(".png") ? "image/png" : "image/jpeg";

      const fd = new FormData();
      // The backend needs an explicit MIME type or the upload 500s.
      fd.append("Images", new File([buf], name, { type }));
      try {
        await raw(`/api/properties/${id}/images`, { method: "POST", body: fd });
        console.log(`      + image ${name}`);
      } catch (e) {
        console.log(`      ! image ${name} failed: ${String(e.message).slice(0, 120)}`);
      }
    }
  } else {
    console.log(`      already has ${haveImages} images`);
  }

  // ── Cover ───────────────────────────────────────────────────────────────────
  const after = await raw(`/api/properties/${id}`);
  const images = after?.data?.images ?? [];
  if (images.length > 0 && !images.some((im) => im.isCover)) {
    // NOTE: rent uses `set-cover`; property-buyings uses `cover`.
    await raw(`/api/properties/${id}/images/${images[0].id}/set-cover`, { method: "PUT" });
    console.log(`      cover set`);
  } else if (images.some((im) => im.isCover)) {
    console.log(`      cover already set`);
  }

  // ── Daily prices ────────────────────────────────────────────────────────────
  // NOTE: DurationInMonths only accepts 1, 2 or 3.
  try {
    const start = new Date().toISOString().slice(0, 10);
    await raw(`/api/properties/${id}/daily-prices/bulk`, jsonPost({
      startDate: start, durationInMonths: 3, endDate: null, price: def.basePrice,
    }));
    console.log(`      daily prices @ ${def.basePrice} for 3 months`);
  } catch (e) {
    console.log(`      ! daily prices failed: ${String(e.message).slice(0, 140)}`);
  }

  // ── listingDetails ──────────────────────────────────────────────────────────
  // The create/PUT payload silently drops checkInHour/checkOutHour, so the
  // dedicated endpoint is the only way to persist the real hours.
  try {
    await raw(`/api/properties/${id}/listing-details`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(def.listingDetails),
    });
    console.log(`      listing details synced (in ${def.listingDetails.checkInHour} / out ${def.listingDetails.checkOutHour})`);
  } catch (e) {
    console.log(`      ! listing details failed: ${String(e.message).slice(0, 140)}`);
  }

  // ── Force isFeatured false when the admin form would have ──────────────────
  if (!def.isFeatured && created) {
    await raw(`/api/properties/${id}/featured`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: "false",
    });
    console.log(`      isFeatured forced false`);
  }

  return id;
}

console.log("=== 1. rent amenity categories + items ===");
const amenityCats = await ensureAmenityCategories();

console.log("\n=== 2. landmarks ===");
const landmarkIds = await ensureLandmarks();

console.log("\n=== 3. location categories ===");
const locs = await raw("/api/Categories");
const locByName = new Map((locs?.data ?? []).map((c) => [String(c.name).toLowerCase(), c.id]));
console.log("  " + (locs?.data ?? []).map((c) => `${c.name}=${c.id}`).join("\n  "));

console.log("\n=== 4. properties ===");
const ids = [];
for (const def of PROPS) {
  ids.push(await seedProperty(def, locByName, amenityCats, landmarkIds));
  console.log("");
}

console.log("seeded property ids:\n" + ids.map((i) => `  ${i}`).join("\n"));