import fs from "node:fs";

const API = "https://rentall.runasp.net";
const TOKEN = fs.readFileSync("C:/Users/VIP/AppData/Local/Temp/opencode/seed2-token.txt", "utf8").trim();

const H = {
  Authorization: `Bearer ${TOKEN}`,
  Accept: "application/json",
  "Accept-Language": "en",
  "X-Locale": "en",
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function req(path, { method = "GET", body, headers = {} } = {}) {
  // The host intermittently times out on connect — retry with backoff.
  let res;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      res = await fetch(`${API}${path}`, { method, headers: { ...H, ...headers }, body });
      break;
    } catch (e) {
      if (attempt === 4) throw new Error(`${method} ${path} network failure: ${e.message}`);
      console.log(`    .. retry ${attempt}/4 after ${e.cause?.code ?? e.message}`);
      await sleep(attempt * 1500);
    }
  }
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = null; }
  if (!res.ok || (json && json.isSuccess === false)) {
    const errs = json?.errors;
    const detail = Array.isArray(errs)
      ? errs.join("; ")
      : errs && typeof errs === "object"
        ? Object.entries(errs).map(([k, v]) => `${k}: ${v}`).join("; ")
        : null;
    const msg = json?.message || detail || text;
    throw new Error(`${method} ${path} -> ${res.status} ${String(msg).slice(0, 300)}`);
  }
  return json;
}

const json = (payload) => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});

const T = (en) => ({ en, ar: en, fr: en, de: en, ru: en });

// ── Amenity categories (matching the mockup) ──────────────────────────────────
const CATEGORIES = [
  {
    name: "General",
    icon: "amenities-general",
    items: ["Air Conditioner", "Internet", "Satellite TV", "Security System", "Washer", "Elevator", "Parking", "Garden"],
  },
  {
    name: "Bed and Bath",
    icon: "amenities-bedbath",
    items: ["Bed Linens", "Bath Towels", "Hair Dryer", "Hot Tub", "Shower", "Toiletries"],
  },
  {
    name: "Dining",
    icon: "amenities-dining",
    items: ["Coffee Maker", "Cooking Basics", "Dishwasher", "High Chair", "Microwave", "Refrigerator"],
  },
  {
    name: "Facilities",
    icon: "amenities-facilities",
    items: ["Bar / Restaurant", "Breakfast Included", "Family Friendly", "Free Parking", "Non Smoking", "Pets Allowed", "Pool", "Wheelchair Accessible"],
  },
];

async function ensureCategories() {
  const existing = await req("/api/property-buying/categories?includeItems=true&onlyActive=false");
  const byName = new Map((existing?.data ?? []).map((c) => [String(c.name).toLowerCase(), c]));
  const result = [];

  for (const [order, def] of CATEGORIES.entries()) {
    let cat = byName.get(def.name.toLowerCase());

    if (!cat) {
      const res = await req("/api/property-buying/categories", {
        ...json({
          name: T(def.name),
          icon: def.icon,
          defaultIcon: def.icon,
          displayOrder: order + 1,
        }),
      });
      cat = res.data;
      console.log(`created category "${def.name}" -> ${cat.id}`);
    } else {
      console.log(`reusing category "${def.name}" -> ${cat.id}`);
    }

    const haveItems = new Set((cat.items ?? []).map((i) => String(i.name).toLowerCase()));
    const itemIds = [];

    for (const [iOrder, itemName] of def.items.entries()) {
      if (haveItems.has(itemName.toLowerCase())) {
        const found = cat.items.find((i) => String(i.name).toLowerCase() === itemName.toLowerCase());
        itemIds.push(found.id);
        continue;
      }
      const res = await req("/api/property-buying/category-items", {
        ...json({
          propertyBuyingCategoryId: cat.id,
          name: T(itemName),
          displayOrder: iOrder + 1,
        }),
      });
      itemIds.push(res.data.id);
      console.log(`    + item "${itemName}"`);
    }

    result.push({ name: def.name, id: cat.id, itemIds });
  }

  return result;
}

// ── Properties with multiple images ──────────────────────────────────────────
const IMAGE_POOL = [
  "public/single-property/gallery-main.png",
  "public/single-property/gallery-living.png",
  "public/single-property/gallery-kitchen.png",
  "public/single-property/gallery-bedroom.png",
  "public/homepage/vacation/vacation-home-pool.jpeg",
  "public/homepage/vacation/resort-pool-wide.jpeg",
  "public/homepage/vacation/coastal-vacation-home.jpeg",
  "public/homepage/vacation/resort-courtyard.jpeg",
  "public/rent/rent-hero-living.jpg",
  "public/rent/beach-lounge-chair-clean.png",
  "public/homepage/locations/sahl-hasheesh.jpg",
  "public/homepage/locations/el-gona.jpg",
];

const PROPS = [
  {
    title: "Sunset Villa in Sahl Hasheesh",
    desc: "A fully furnished beachfront villa with a private infinity pool, generous outdoor living and direct access to the bay promenade. Finished to a high specification with an open-plan living area that opens onto the pool terrace.",
    type: 2, beds: 4, baths: 4, area: 320, floors: 2, price: 1450, year: 2024,
    city: "Hurghada", areaName: "Sahl Hasheesh", lat: 27.04, lon: 33.75, images: 6,
    catMix: [0, 1, 2, 3, 4, 5],
  },
  {
    title: "Modern Apartment in ElGouna",
    desc: "A bright, contemporary apartment moments from the marina, with an open-plan kitchen, private balcony and full resort amenities including a shared pool and secure parking.",
    type: 1, beds: 2, baths: 2, area: 140, floors: 1, price: 620, year: 2023,
    city: "Hurghada", areaName: "ElGouna", lat: 27.74, lon: 33.68, images: 5,
    catMix: [0, 1, 2, 3],
  },
  {
    title: "Sea-View Penthouse in Hurghada",
    desc: "A corner penthouse with panoramic sea views across the bay, double-height glazing and a wraparound terrace. Comes fully furnished and ready to move into.",
    type: 8, beds: 3, baths: 3, area: 240, floors: 3, price: 980, year: 2025,
    city: "Hurghada", areaName: "El Kawther", lat: 27.2578, lon: 33.8116, images: 7,
    catMix: [0, 1, 2, 3],
  },
  {
    title: "Garden Chalet in El Sahel",
    desc: "A quiet garden chalet set back from the beach, with a shaded terrace, outdoor dining area and mature planting. Ideal as a private holiday retreat or a well-performing rental.",
    type: 4, beds: 2, baths: 2, area: 130, floors: 1, price: 480, year: 2022,
    city: "Hurghada", areaName: "El Sahel", lat: 27.13, lon: 33.79, images: 4,
    catMix: [0, 1, 3],
  },
];

// Location categories (from /api/Categories) — `categoryId` must be a real Guid.
const locationCats = await req("/api/Categories");
const locationByName = new Map((locationCats?.data ?? []).map((c) => [String(c.name).toLowerCase(), c.id]));

async function createProperty(def, cats) {
  const locationCategoryId =
    locationByName.get(String(def.areaName).toLowerCase()) ?? (locationCats?.data ?? [])[0]?.id;

  const existing = await req("/api/property-buyings?pageNumber=1&pageSize=100");
  const found = (existing?.data?.items ?? []).find((p) => p.title === def.title);
  let id = found?.id;

  // Verified contract for POST/PUT /api/property-buyings/{id}:
  //   * `dto` must be present but its contents are ignored — `{}` is enough
  //   * `title` / `description` must be TranslationInputDto OBJECTS at root level
  //   * `address.*` must be PLAIN STRINGS at root level (not translation objects)
  //   * `categoryId` must be a real Guid from /api/Categories
  const payload = {
    dto: {},
    categoryId: locationCategoryId,
    title: T(def.title),
    description: T(def.desc),
    price: def.price,
    currency: "USD",
    propertyTypeId: def.type,
    status: 1,
    bedrooms: def.beds,
    bathrooms: def.baths,
    floors: def.floors,
    garage: 1,
    area: def.area,
    yearBuilt: def.year,
    latitude: def.lat,
    longitude: def.lon,
    videoUrl: "",
    virtualTourUrl: "",
    address: {
      country: "Egypt",
      state: "Red Sea",
      city: def.city,
      area: def.areaName,
      street: `${def.areaName} Road`,
      zipCode: "84511",
    },
    categoryValues: [],
  };

  if (!id) {
    const res = await req("/api/property-buyings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    id = res.data.id;
    console.log(`created property "${def.title}" -> ${id}`);
  } else {
    console.log(`property "${def.title}" exists -> ${id}`);
  }

  // Images — skip if already uploaded.
  const detail = await req(`/api/property-buyings/${id}`);
  const haveImages = (detail?.data?.images ?? []).length;

  if (haveImages === 0) {
    for (let i = 0; i < def.images; i++) {
      const rel = IMAGE_POOL[def.catMix[i % def.catMix.length]] ?? IMAGE_POOL[0];
      const buf = fs.readFileSync(rel);
      const name = rel.split("/").pop();
      const type = name.endsWith(".png") ? "image/png" : "image/jpeg";

      const fd = new FormData();
      for (const [k, v] of Object.entries(T(def.title))) fd.append(`Title.${k}`, v);
      fd.append("Images", new File([buf], name, { type }));

      try {
        await req(`/api/property-buyings/${id}/images`, { method: "POST", body: fd });
        console.log(`    + image ${i + 1}/${def.images} (${name})`);
      } catch (e) {
        console.log(`    ! image ${i + 1} failed: ${String(e.message).slice(0, 120)}`);
      }
    }

    // Make the first one the cover.
    const after = await req(`/api/property-buyings/${id}`);
    const first = (after?.data?.images ?? [])[0];
    if (first) {
      const fd = new FormData();
      await req(`/api/property-buyings/${id}/images/${first.id}/cover`, { method: "PUT", body: fd });
      console.log(`    cover set`);
    }
  } else {
    console.log(`    already has ${haveImages} images`);
  }

  // Amenities — pick a deterministic subset per property.
  const itemIds = [];
  for (const [ci, cat] of cats.entries()) {
    if (!def.catMix.includes(ci)) continue;
    const take = ci === 0 ? 4 : 3;
    itemIds.push(...cat.itemIds.slice(0, take));
  }

  await req(`/api/property-buyings/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    // The body must repeat `id` — the API rejects a mismatch with the URL.
    body: JSON.stringify({ ...payload, id, categoryValues: itemIds.map((itemId) => ({ itemId })) }),
  });

  // Publish so it shows on the public /buy grid.
  await req(`/api/property-buyings/${id}/publish`, { method: "PUT" });
  console.log(`    amenities: ${itemIds.length} values | published`);
  return id;
}

console.log("=== 1. amenity categories ===");
const cats = await ensureCategories();

console.log("\n=== 2. properties + images + amenities ===");
const ids = [];
for (const def of PROPS) {
  ids.push(await createProperty(def, cats, cats));
  console.log("");
}

console.log("seeded property ids:", ids.join(", "));