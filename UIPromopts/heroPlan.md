# Hero Section — Redesign Plan (match `heroDesign.png`)

**Target file:** `components/HeroSection.tsx` (single file, 298 lines)
**Supporting:** `lib/i18n/locales/{en,ar,fr,de,ru}.json`, `public/homepage/heroSection1/`
**API impact:** none — the form only reads `formData` and pushes a router query string.

---

## 0. Good news

The asset `public/homepage/heroSection1/hero-luxury.jpg` is **already the exact photo** used in
the mockup. No new image needed.

The design's type scale also already matches the current component — measuring the mockup,
the headline is ~3.57× the subtitle; the code is `text-[70px]` / `text-[20px]` = 3.5×. So
**font sizes stay as they are.** The real gaps are position, crop, shadow, and the form layout.

---

## 1. Gap analysis: design vs current

| # | Aspect | Design | Current | Severity |
|---|---|---|---|---|
| 1 | **Image crop** | Full scene — sky, buildings, both pools all visible | `object-bottom` + `objectPosition:"center 32%"` crops the sky and pushes buildings up | High |
| 2 | **Text position** | Text block sits ~22–45% down the image (optical centre) | Pinned near the very top: `top-[30px] sm:top-[50px] lg:top-[60px]` | High |
| 3 | **Text shadow** | Clean white text, **no shadow** | `drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]` + two more shadow variants on all 3 lines | High |
| 4 | **Form row 1** | `[Keywords input] [For Rent] [For Sale] [All ▾] [Search]` | `[Check-in] [Check-out] [Adults] [Search]` | **High — rebuild** |
| 5 | **Rent/Buy toggle** | 3 pills: For Rent / For Sale / All | Does not exist | **New** |
| 6 | **Keyword search** | Text input, placeholder `Search Keywords, e.g. "Sea View Villa"` | Does not exist | **New** |
| 7 | **Card width** | ~66% of viewport (≈950px at 1440) | `max-w-[1020px]` | Low |
| 8 | **Input density** | Compact (~28px in a 636px design ≈ 4.4% vh) | `h-10` / `h-[38px]` / `xl:h-[48px]` — proportionally taller | Low |
| 9 | **i18n coverage** | (mockup is English-only) | Row 2 labels + "Search" are **hardcoded English literals** | Medium — bug for 5 locales |
| 10 | **Subtitle spacing** | Subtitle→description gap is very tight (~6px) | `mt-3` then `mt-1.5` | Low |

---

## ✅ Phase 1 & 2 — DONE (image + text placement only)

Filters/form deliberately left untouched. Changes applied to `components/HeroSection.tsx`:

| Change | Before | After |
|---|---|---|
| Image object-position | `object-bottom` + inline `objectPosition: "center 32%"` (cropped sky) | `object-cover object-center`, inline style removed |
| Text block position | `top-[30px] sm:top-[50px] lg:top-[60px]` | `top-[14%] sm:top-[17%] lg:top-[21%] xl:top-[22%]` + `z-20` |
| Text shadows | `drop-shadow` on h1 + both paragraphs | removed (clean white, per mockup) |
| Subtitle→desc gap | `mt-1.5` | `mt-1` |
| Comment | "anchored towards the bottom…" | "full scene visible — sky, buildings and both pools" |

**Why percentages:** the text wrapper's containing block is the full-height hero wrapper, so
`%` scales with the responsive heights and keeps the optical position at every breakpoint.

**Round 2 — zoom out + description width:**

| Change | Before | After |
|---|---|---|
| Image container | `h-[480px] sm:h-[560px] lg:h-[660px] xl:h-[720px] 2xl:h-[750px]` | `h-[480px] sm:h-[560px] lg:h-auto lg:aspect-[1400/745]` |
| Description max-width | `max-w-[560px]` (wider than the title) | `max-w-[220px] sm:max-w-[300px] lg:max-w-[400px]` |
| Description spacing | `mt-1` | `mt-2` |

**Round 3 — corrected zoom-out (round 2 was too aggressive):**

Round 2 used `lg:aspect-[1400/745]` (the photo's own 1.879 ratio) with no height cap. Because
the container is `w-full`, height scales with viewport width **unbounded** — at 1920px that is
1022px and at 2560px it is 1362px, i.e. *taller* than the original fixed 750px. On a wide
monitor the hero ballooned.

The design's real proportion is **1080:555 ≈ 1.95:1** (measured off `heroDesign.png`), which is
only slightly wider than the photo's 1.879 — so `object-cover` trims a sliver vertically
instead of cropping ~17% off the sides. Final:

```
h-[480px] sm:h-[560px] lg:h-auto lg:aspect-[1080/555] 2xl:h-[780px] 2xl:aspect-auto
```

Resulting hero heights vs. the two previous attempts:

| Viewport | Original (fixed) | Round 2 (uncapped) | **Round 3** |
|---|---|---|---|
| 1024 (`lg`) | 660 | 545 | **526** |
| 1280 (`xl`) | 720 | 681 | **658** |
| 1440 | 720 | 766 | **740** |
| 1536 (`2xl`) | 750 | 817 | **780** |
| 1920 | 750 | 1022 ⚠ | **780** |
| 2560 | 750 | 1362 ⚠ | **780** |

Kept the aspect ratio at `lg`/`xl` (where it genuinely reduces crop) but restored a height cap
at `2xl` so it can never grow past ~780px on large displays.

**Why those description widths:** measured from the mockup, the description is **~82%** of the
headline's width. The headline is two 11-character lines of Poppins Black (≈0.62em average
advance), so it renders ≈232px @34px, ≈340px @50px, ≈476px @70px. The new max-widths
(220 / 300 / 400) stay just under each, so the description can never render wider than the
title above it at any breakpoint.

**Verified:** `npm run lint` — `HeroSection.tsx` reports 0 problems (the 213 repo-wide issues
are pre-existing in other files). `npm run build` — passes.

**Still needs your eyes:** crop + text position at `lg` and `2xl`. Adjust `lg:top-[21%]` /
`xl:top-[22%]` if it reads high or low. With shadows gone, check white text over the bright
sky — a soft gradient scrim may be needed (Open Question #5).

---

## 2. Phase 1 — Text block (items 2, 3, 10) — *(superseded by the DONE section above)*

**Replace** the absolute top-pinned wrapper:

```tsx
// remove
className="absolute left-1/2 top-[30px] w-[calc(100%-28px)] max-w-[1120px]
           -translate-x-1/2 text-center sm:top-[50px] lg:top-[60px]"
```

**With** an optically-centred block:

```tsx
className="absolute inset-x-0 top-[16%] z-20 mx-auto w-[calc(100%-28px)]
           max-w-[1120px] text-center sm:top-[18%] lg:top-[20%]"
```

- Drop all three `drop-shadow-[...]` utilities (h1, subtitle, description).
- Tighten the description gap: `mt-1.5` → `mt-1`.
- Keep `font-black uppercase` on the h1 — matches the mockup.
- Keep the existing `max-w-[560px]` clamp on the description.

> Note: with the header overlaying the hero, verify at each breakpoint that `top-[16–20%]`
> doesn't collide. Adjust as needed.

---

## 3. Phase 2 — Image crop (item 1)

**Current** (lines 74–75) crops aggressively:

```tsx
className="object-cover object-bottom"
style={{ objectFit: "cover", objectPosition: "center 32%" }}
```

**Change to** reveal the full composition:

```tsx
className="object-cover object-center"
style={{ objectFit: "cover", objectPosition: "center 45%" }}
```

Also reconsider the Ken Burns wrapper — `-inset-[20px]` exists to hide scale-up edges. Keep it,
it's harmless.

**Optional:** the container heights (`h-[480px] … 2xl:h-[750px]`) are fine, but if the photo
still feels cramped on short/wide viewports, bias the heights slightly taller.

---

## 4. Phase 3 — Rebuild form row 1 (items 4, 5, 6, 7, 8)

### New row 1 layout

```
┌──────────────────────────────────────────────────────────────┐
│ [ Search Keywords… ] [For Rent] [For Sale] [ All ▾ ] [Search]│
├──────────────────────────────────────────────────────────────┤
│ Min Price │ Max Price │ Rooms │ Location │ Property Type     │
└──────────────────────────────────────────────────────────────┘
```

- Keywords input: `flex-1`, white pill, placeholder from i18n.
- `For Rent` / `For Sale`: toggle pills (white bg; active gets the teal accent `#7faeb9`).
- `All`: white pill with `ChevronDown` affordance.
- `Search`: teal filled pill, right-aligned, `shrink-0`.
- Card: `max-w-[1020px]` → `max-w-[960px]`.
- Inputs: drop `xl:h-[48px]` → `h-[42px]`; row-2 controls `h-[38px]` → `h-[36px] sm:h-[38px]`.

### Removed fields
`checkIn` (`from`), `checkOut` (`to`), `minCapacity` — **the design has no date inputs.**
See Open Question #1 before deleting.

### `handleSubmit` changes
Add local state for the intent (`"rent" | "buy" | "all"`) and keywords, and branch the push:

```ts
const intent = "rent" | "buy" | "all";
// For Sale / All → /buy, otherwise → /rent
router.push(href(`${intent === "rent" ? "/rent" : "/buy"}?${params}`));
```

If a `keywords` field is added, append it and confirm the target endpoint accepts it
(`/api/properties/search`).

---

## 5. Phase 4 — i18n (item 9)

Row 2 labels and the Search button are currently raw English literals — they will stay English
for `ar`/`fr`/`de`/`ru`. Add a new key group and wire it with `t()`.

**New keys (add to all 5 locale files):**

```jsonc
"home": {
  "hero": {
    "keywords":        "Search Keywords",
    "keywordsExample": "Search Keywords, e.g. \"Sea View Villa\"",
    "forRent":         "For Rent",
    "forSale":         "For Sale",
    "all":             "All",
    "search":          "Search",
    "minPrice":        "Min Price",
    "maxPrice":        "Max Price",
    "rooms":           "Rooms",
    "location":        "Location",
    "propertyType":    "Property Type"
  }
}
```

Note `home.hero` currently holds `titlePrefix` / `titleHighlight` / `subtitle` / `checkIn` /
`checkOut` / `searchHomes` — **none of which the hero actually uses** (it hardcodes its own
copy). Decide whether to adopt them or leave as-is. Also note `home.hero.titlePrefix` says
*"From Home To"* which does **not** match the mockup's *"YOUR FUTURE STARTS HERE"* — the
mockup copy should win, so keep the literals or update the keys.

---

## 6. Out of scope (deliberately)

- Sticky/rounded hero bottom edge — the mockup shows a hard edge.
- Carousel or extra hero slides.
- Font changes (scale already matches).
- New hero image.

---

## 7. Open questions — need your call before Phase 3/4

1. **Dates.** The design drops Check-in / Check-out. Removing them removes the primary filter
   from the landing page. Options:
   - (a) Remove from hero; dates remain available on the `/rent` results page filters.
   - (b) Keep dates, tuck them behind the `All` pill or a "Dates" toggle.
   - (c) Keep a single combined date-range picker in place of Keywords.
2. **What does `All` do?** Rent-only, Buy-only, or a merged listing? And `For Sale` →
   `/buy?` — confirm the target route and its expected params.
3. **Keyword search** — does `/api/properties/search` accept a free-text keyword, and should the
   hero keywords map to it or to a property name filter?
4. **Adults field** — currently maps to `MinCapacity`. Confirm removal or relocation.
5. **Text contrast** — with the shadow removed, confirm legibility over the sky at the top of the
   image; may need a soft gradient scrim instead.

---

## 8. Execution order

1. Phase 1 (text position + shadow) — isolated, low risk
2. Phase 2 (image crop) — isolated, low risk
3. Phase 5 (i18n keys) — additive, no visual change
4. Answer Open Questions 1–4
5. Phase 3 (form rebuild) — largest change, touches submit logic
6. Phase 4 → wire `t()` into the rebuilt form

## 9. Verification

Per your instruction I cannot open a browser. Each phase will be verified with:

```bash
npm run lint
npm run build
```

Visual confirmation of crop/position will need to be checked by you at
`/{locale}` — I'll call out exactly which breakpoints to inspect.