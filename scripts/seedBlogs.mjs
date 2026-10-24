import fs from "node:fs";

const API = "https://rentall.runasp.net";
const TOKEN = fs.readFileSync("C:/Users/VIP/AppData/Local/Temp/opencode/blog-token.txt", "utf8").trim();

const headers = (extra = {}) => ({
  Authorization: `Bearer ${TOKEN}`,
  Accept: "application/json",
  "Accept-Language": "en",
  "X-Locale": "en",
  ...extra,
});

// Every field is repeated across all 5 locales so switching language never 404s
// or blanks out — per the plan's English-first localisation strategy.
const allLocales = (text) => ({
  En: text, Ar: text, Fr: text, De: text, Ru: text,
});

// The backend validates the extension from the filename AND needs an explicit
// content type — a File with no `type` makes it fail with a 500.
const MIME = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

const img = (rel) => fs.readFileSync(rel);
const file = (rel) => {
  const name = rel.split("/").pop();
  const ext = name.slice(name.lastIndexOf(".")).toLowerCase();
  const type = MIME[ext];
  if (!type) throw new Error(`unsupported image extension for ${rel} (allowed: ${Object.keys(MIME).join(", ")})`);
  return new File([img(rel)], name, { type });
};

async function req(path, options) {
  const res = await fetch(`${API}${path}`, options);
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = null; }
  if (!res.ok) {
    throw new Error(`${options.method} ${path} -> ${res.status} ${text.slice(0, 400)}`);
  }
  return json;
}

// ── Content ──────────────────────────────────────────────────────────────────
const BLOGS = [
  {
    slug: "the-ultimate-guide-to-buying-luxury-real-estate-in-hurghada-el-gouna",
    title: "The Ultimate Guide to Buying Luxury Real Estate in Hurghada & El Gouna",
    summary:
      "Everything foreign buyers and local investors need to know about navigating property acquisition, freehold rights, and prime coastal communities along the Egyptian Red Sea.",
    content:
      "With year-round sunshine, crystalline waters, and an expanding international airport, the Red Sea Riviera has transformed from a holiday paradise into one of the Mediterranean and Middle East's most resilient property markets. Whether you are seeking a seaside vacation retreat or an income-generating rental asset, making a confident investment requires understanding regional regulations, local amenities, and neighborhood value drivers.\n\nThis guide walks through what actually moves the needle for an acquisition here: how freehold status works, which communities carry the strongest structural demand, what legal due diligence should look like in practice, and how to keep an overseas asset running without it becoming a second job.",
    hero: "public/homepage/locations/el-gouna.png",
    sections: [
      {
        title: "Why the Red Sea Riviera is Attracting Global Capital",
        content:
          "The investment case here rests on a short, unusually specific list of fundamentals. Well-positioned apartments and villas currently clear at net annual yields in the region of 8-12%, driven by sustained winter demand from European and Gulf travellers rather than a speculative pipeline. For holders of USD and EUR, the currency dynamics have worked in the buyer's favour as the pound has absorbed most of the local cost base.\n\nTwo structural advantages compound that yield. First, primary residential purchases carry 0% capital gains tax, which materially changes the maths on a medium-term hold versus a standard leveraged investment. Second, the residency pathway tied to property ownership gives buyers a route to extended stays without a conventional residency permit, removing a friction that applies in most comparable markets.\n\nThe caveat worth stating plainly: yields compress quickly in poorly located stock. The spread between a sea-facing unit on a managed compound and a road-facing apartment five minutes inland is routinely 300-400 basis points. Underwrite the specific unit, not the neighbourhood average.",
        image: "public/homepage/locations/el-gona.jpg",
      },
      {
        title: "Neighborhood Comparison: El Gouna vs. Sahl Hasheesh vs. Hurghada",
        content:
          "El Gouna, Sahl Hasheesh and central Hurghada are not interchangeable, and the difference shows up directly in exit liquidity.\n\nEl Gouna is the premium European-styled community built around interconnected lagoons. Its marina infrastructure and established rental management ecosystem command the highest absolute prices and the most predictable occupancy, at the cost of the deepest entry prices in the region.\n\nSahl Hasheesh occupies the middle-to-upper band: a crescent bay under master-planned control, with a long promenade, gated compounds and a far more limited supply pipeline than Hurghada. Scarcity is the defining characteristic here.\n\nCentral Hurghada — El Kawther and the Mamsha corridor — delivers the highest turnover and the widest rental yield spread. It is also the most operationally demanding and the least physically exclusive. Choose it for cash flow; choose El Gouna or Sahl Hasheesh for holding value.\n\nWhichever you pick, visit across a weekday and a weekend before committing. The difference in atmosphere between the two is usually the difference between the unit appreciating and the unit sitting empty.",
        image: "public/homepage/vacation/resort-night-view.jpeg",
      },
      {
        title: "Legal Due Diligence, Contracts & Ownership Rights",
        content:
          "This is the section where an otherwise sound purchase can quietly go wrong. Work through it in order.\n\nFreehold vs. leasehold. Egyptian real estate operates on a freehold basis, but the title structure varies by project age and developer. Confirm the land is registered and that the seller's title matches the registered deed before paying anything.\n\nThe primary sales contract (Ektetab) is the binding instrument at this stage. Read the completion schedule, the penalty clauses for late handover, and — critically — the specification schedule. Marketing renders are not contractual.\n\nPower of Attorney (Tawkeel) is required if you are not in Egypt to execute registration. Use a registered, independent translator and confirm the POA scope covers registration, utilities and leasing, since a narrowly drafted POA becomes an expensive problem the first time you need to fix something remotely.\n\nFinally, verify the developer independently: registered documents, delivery record on previous phases, and any outstanding litigation. A developer three phases ahead of schedule is a materially safer counterparty than one delivering its first.",
        image: "public/homepage/services/building.jpg",
      },
      {
        title: "Furnishing & Turnkey Management for Overseas Owners",
        content:
          "Salt air, summer heat and intermittent utility supply are the three things that shorten the life of an unattended property. Furnishing decisions should be made against those constraints rather than against a show home.\n\nClimate-resistant finishes matter more than trend. Powder-coated aluminium over painted steel, marine-grade stainless in exposed fittings, and stone or large-format tile rather than timber in ground-floor and pool-adjacent spaces. Upholstery in performance fabric. These choices cost marginally more up front and materially reduce upkeep.\n\nOn utilities, an overseas owner should assume intermittent mains. A properly sized inverter backup for the AC compressor, a surge-protected distribution board, and a water storage tank with a pump are not luxuries — they are what keeps the property insurable and rentable.\n\nThe practical alternative is turnkey management: a single operator handling maintenance, cleaning, pool servicing, garden care and guest turnover. For most international owners this is the difference between owning an asset and supervising one. Partnering with Sea Key Property keeps the property maintained and income-generating continuously, without you needing to be in the country.",
        image: "public/homepage/vacation/vacation-home-pool.jpeg",
      },
    ],
  },

  {
    slug: "maximizing-vacation-rental-returns-a-homeowners-playbook-for-2026",
    title: "Maximizing Vacation Rental Returns: A Homeowner's Playbook for 2026",
    summary:
      "Practical strategies for transforming your seaside apartment or villa into a high-demand, 5-star short-term rental that commands premium nightly rates.",
    content:
      "The short-term holiday rental market along Egypt's coast has surged as global and regional travelers increasingly prefer private, stylish residences over standard hotel suites. However, standing out in a competitive luxury segment requires far more than merely posting photos on an online portal. High yields demand thoughtful staging, proactive pricing algorithms, and hospitality-grade guest experiences.\n\nThis playbook sets out the four levers that move net return most reliably in 2026 — design, pricing, maintenance and management — and the order in which to pull them.",
    hero: "public/homepage/vacation/coastal-vacation-home.jpeg",
    sections: [
      {
        title: "Interior Design & Staging for 5-Star Reviews",
        content:
          "Review scores drive ranking far more than listing price does, and review scores are decided in the first ninety seconds a guest walks in. Stage for that moment.\n\nMaterials should read coastal and organic: washed linen, pale oak, rattan, stoneware, unbleached cotton. Avoid anything that reads as a short-let catalogue special — the saturated accent and the matching throw cushion date a listing instantly.\n\nThree functional details consistently separate five-star listings from four-star ones. Blackout curtains on every bedroom window; a mattress specified at a level guests notice rather than tolerate; and genuinely fast fibre, tested in the room rather than assumed from the unit's marketing.\n\nWelcome amenities should be small, considered and consumable — good coffee, proper tea, a local map that is actually current, a folded towel rather than a rolled one. Guests remember specificity.\n\nFinally, photograph at golden hour with the camera at seated eye level. The listing that wins is almost never the one with the most photos; it is the one where the first image is honest about the light the space actually gets.",
        image: "public/single-property/gallery-bedroom.png",
      },
      {
        title: "Dynamic Seasonal Pricing & Calendar Optimization",
        content:
          "Static rates are the most common and most expensive mistake in short-let management. The same unit can justify a 300% swing between its best and worst week of the year.\n\nThe demand calendar on the Red Sea coast is shaped by a high winter, not a high summer. October through April carries the premium weeks, driven by European and Gulf escape demand, with the deepest peaks around the New Year period. Summer is not dead — it is simply a different product, and it prices against water sports, school holidays and domestic weekend demand rather than against winter sun-seeking.\n\nManage occupancy as a portfolio, not a unit. Gapping out to protect a high-value week beats filling it at a discount: a full calendar at depressed rates is worth less than a selectively blocked calendar.\n\nTargeting sustained occupancy above 80% annually requires accepting that peak weeks are not negotiable and shoulder weeks are. Build the calendar backwards from the weeks you cannot sell, then price the remainder against comparable, not against hope.\n\nFinally, treat minimum-stay rules as a pricing instrument. A three-night minimum in peak season raises average booking value more reliably than a modest rate increase does.",
        image: "public/blogs/articles.png",
      },
      {
        title: "Preventative Maintenance & Keyless Smart Access",
        content:
          "Margins on short-let properties are consumed almost entirely by downtime, and downtime is a maintenance problem. The operating principle is simple: fix things on a schedule so they never fail in front of a guest.\n\nSalt air is the defining environmental stressor on this coast. HVAC units in particular need servicing far more frequently than inland equivalents — filters, coils and condenser clearance should sit on a fixed monthly cycle, not a reactive one.\n\nKeyless smart entry is now baseline rather than premium. It removes the coordination cost of in-person handovers entirely, allows a cleaner or maintenance contractor access without a host being present, and produces an audit trail that resolves disputes. Pair it with automated air-conditioning scheduling so the unit is at a comfortable temperature before arrival rather than running empty all day.\n\nTurnover speed directly determines revenue. Same-day cleaning capability with a pre-staged linen inventory is what lets you sell back-to-back bookings; without it, you lose a night per turnover and that compounds across a season.\n\nDocument every intervention in a single property log. Over a year it becomes the asset history you need for maintenance budgeting and for any future sale.",
        image: "public/single-property/gallery-kitchen.png",
      },
      {
        title: "Why Professional Property Management Delivers Higher Net Profit",
        content:
          "The honest arithmetic: a well-run unit can net 35% more than the same unit self-managed, and almost none of that difference comes from a better listing.\n\nIt comes from utilisation. Self-managed properties lose nights — to slow replies, to coordination gaps, to a single maintenance issue that blocks the calendar for a week. Professional management keeps the booking rate higher by responding in minutes rather than hours, and accepts the bookings a casual owner declines because they fall outside convenient hours.\n\nThe second lever is distribution. A single channel caps your reach; professional multi-platform marketing puts the same unit in front of audiences that do not overlap, which is how rates rise without the unit changing.\n\nThe third is cost control through volume. Maintenance scheduling, linen logistics and consumables all get materially cheaper per booking at scale, and a resident on-site team resolves an emergency in hours rather than days.\n\nWhat the owner actually buys is time. Two or three hours a week of active oversight is the realistic self-management commitment, and it rarely survives a long trip. With 24/7 guest communication, professional marketing and on-site maintenance handled, net returns rise by up to 35% while the owner is removed from the operational loop entirely.",
        image: "public/homepage/vacation/resort-courtyard.jpeg",
      },
    ],
  },

  {
    slug: "living-in-sahl-hasheesh-the-epitome-of-gated-red-sea-luxury",
    title: "Living in Sahl Hasheesh: The Epitome of Gated Red Sea Luxury",
    summary:
      "Discover what makes Sahl Hasheesh Egypt's most exclusive coastal enclave, from 12.5 km of pristine bay coastline to championship golf and European-style piazzas.",
    content:
      "Nestled along a crescent-shaped bay just 20 minutes south of Hurghada International Airport, Sahl Hasheesh represents the pinnacle of master-planned luxury living on Egypt's Red Sea coast. Sheltered by the Red Sea mountains and fringed by coral reefs, this secure gated community offers an oasis of tranquility, architectural elegance, and five-star resort living.\n\nWhat follows is a look at how that enclave actually works day to day — the infrastructure, the shoreline, the community hub, and what the pipeline means for anyone buying here now.",
    hero: "public/homepage/locations/sahl-hasheesh.jpg",
    sections: [
      {
        title: "Master-Planned Infrastructure & Gated Security",
        content:
          "Sahl Hasheesh was built as a single controlled development rather than assembled plot by plot, and the difference is visible in almost every detail a resident touches.\n\nThe entrance gates set the tone immediately: pharaonic in silhouette, discreet in operation, with 24/7 manned access control and visitor screening at the perimeter. Once inside, the road network is landscaped and separated from pedestrian circulation. Golf-cart paths and shaded walkways mean that within the bay you can move without crossing a main road.\n\nInfrastructure was buried rather than retrofitted. Subterranean cabling for power and data, drainage engineered for flash events, and street lighting integrated into the boulevard planting. None of this is visible on a brochure; all of it is what separates a managed community from a subdivision.\n\nFor buyers, the practical implication is resale. Scarcity of correctly planned, correctly built stock is the core of Sahl Hasheesh's pricing power. Units inside the original master-planned phases carry a persistent premium over later infill precisely because they inherit this infrastructure.\n\nResidency is straightforward and, unusually for the region, quiet — the community is large enough to disperse visitors and small enough that security remains genuinely visible rather than nominal.",
        image: "public/homepage/locations/makadi-heights.png",
      },
      {
        title: "The 12.5 km Beachfront Promenade & Marine Life",
        content:
          "The bay's defining feature is its continuous shoreline — roughly 12.5 km of usable, walkable coast that functions as the community's main public space.\n\nThe promenade is designed for continuous circulation rather than destination points. Sunrise cycling is the established ritual: the light off the water before the wind picks up is the reason residents run the stretch regularly. Beyond the promenade sit private beach clubs with day beds and service, each serving a specific compound.\n\nThe marine environment is the other differentiator. The fringing reef system includes the well-known sunken city snorkelling site, a genuinely rare draw within a few hundred metres of shore. Visibility is consistently good, and the reef shelters the bay from the strongest swell, which keeps conditions comfortable for most of the year.\n\nWater sports operate directly in front of the residential compounds — kitesurfing and diving operators work the bay, and the sailing and paddle conditions are reliable.\n\nFor an owner, the practical value of that shoreline is continuity of appeal. A resort's value tracks its beach; a bay with 12.5 km of walkable coast and a living reef does not have a single seasonal failure point the way a single-frontage property does.",
        image: "public/homepage/vacation/resort-pool-wide.jpeg",
      },
      {
        title: "Old Town Piazza, Waterfront Dining & Culture",
        content:
          "Any credible master-plan has to solve winter, when the beach is pleasant but the evenings are long. Sahl Hasheesh solves it with Old Town.\n\nThe piazza is the community's social anchor: an Italian town-square reference translated to the Red Sea coast, with illuminated fountains, alfresco dining terraces, artisanal gelato and small boutique retail. The design intent is to give the bay a year-round centre of gravity rather than a seasonal one.\n\nIn practice this means the promenade does not empty after sunset. Dining runs late, the fountains give the space a focal point after dark, and weekend evenings generate genuine footfall rather than being a dining room that empties at nine.\n\nIt is worth being clear-eyed about scale. Old Town is compact and unhurried, not a nightlife destination. If a lively evening scene is a non-negotiable, Hurghada proper delivers more of it. What Sahl Hasheesh offers instead is a consistent, well-maintained standard that holds its value through the calendar.\n\nLive music and seasonal events in the piazza add a layer that most competing communities cannot replicate without new construction — which is precisely why those plots cost what they do.",
        image: "public/homepage/locations/hurghada.png",
      },
      {
        title: "Investment Horizons & Upcoming Waterfront Developments",
        content:
          "Sahl Hasheesh's investment case rests on constrained supply meeting durable demand, and it is worth understanding where that supply is actually coming from.\n\nThe property types that carry the strongest demand are sea-facing penthouses, beachfront townhomes, and private pool villas on the more sheltered stretches of the bay. Villas in particular trade at a widening premium, because they can be used year-round rather than seasonally, and because the pool-and-privacy configuration is scarce within a community of this density.\n\nThe current development pipeline concentrates on infill within existing phases rather than greenfield expansion. That matters: it means supply keeps arriving without the community's character being diluted by unrelated new districts.\n\nPayment structures are typically more flexible than buyers from other markets expect, with extended instalment schedules common on off-plan purchases. That flexibility is real, but it should be modelled against a conservative occupancy assumption rather than an optimistic one.\n\nOn exit, the profile of resale demand is broad and internationally diversified, which supports liquidity in a way that narrower resort communities cannot claim. For a buyer seeking durable holding value rather than maximum yield, Sahl Hasheesh is currently the most defensible address on the Egyptian Red Sea coast.",
        image: "public/homepage/vacation/holiday-resort-portrait.jpeg",
      },
    ],
  },
];

// ── Run ──────────────────────────────────────────────────────────────────────
const DRY = process.argv.includes("--dry-run");

if (!DRY) {
  // Remove the obvious test post the plan calls out.
  const existing = await req("/api/blogs?pageNumber=1&pageSize=50", { headers: headers() });
  const items = existing?.data?.items ?? existing?.data ?? [];
  for (const b of items) {
    const t = String(b.title ?? "").toLowerCase();
    if (/asdf|fasdf|test/.test(t)) {
      await req(`/api/blogs/${b.id}`, { method: "DELETE", headers: headers() });
      console.log(`removed test blog "${b.title}" (${b.id})`);
    }
  }
}

for (let i = 0; i < BLOGS.length; i++) {
  const b = BLOGS[i];
  const order = i + 1;

  const fd = new FormData();
  for (const [k, v] of Object.entries(allLocales(b.title))) fd.append(`Title.${k}`, v);
  for (const [k, v] of Object.entries(allLocales(b.summary))) fd.append(`Summary.${k}`, v);
  for (const [k, v] of Object.entries(allLocales(b.content))) fd.append(`Content.${k}`, v);
  fd.append("FeaturedImage", file(b.hero));
  fd.append("IsPublished", "true");
  fd.append("DisplayOrder", String(order));

  if (DRY) {
    console.log(`DRY  would create blog #${order}: ${b.title}`);
    console.log(`      hero: ${b.hero} | ${b.sections.length} sections`);
    continue;
  }

  const created = await req("/api/blogs", { method: "POST", headers: headers(), body: fd });
  const blogId = created?.data?.id;
  if (!blogId) throw new Error(`no blog id returned for "${b.title}"`);
  console.log(`created blog #${order}: ${b.title}\n         id=${blogId}`);

  for (let s = 0; s < b.sections.length; s++) {
    const sec = b.sections[s];
    const sfd = new FormData();
    for (const [k, v] of Object.entries(allLocales(sec.title))) sfd.append(`Title.${k}`, v);
    for (const [k, v] of Object.entries(allLocales(sec.content))) sfd.append(`Content.${k}`, v);
    sfd.append("Image", file(sec.image));
    sfd.append("DisplayOrder", String(s + 1));
    sfd.append("SectionType", "text");
    await req(`/api/blogs/${blogId}/sections`, { method: "POST", headers: headers(), body: sfd });
    console.log(`    section ${s + 1}: ${sec.title}`);
  }
}

if (DRY) console.log("\nDry run complete — no changes made.");