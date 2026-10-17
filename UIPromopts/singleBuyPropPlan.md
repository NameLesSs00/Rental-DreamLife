# Single Buy Property Page — Design Alignment Plan

**Target:** `components/SingleBuyPropertyPageContent.tsx` (333 lines)
**Supporting:** `components/ContactForm.tsx`, `components/PropertyImageGallery.tsx`, `components/DynamicAmenityIcon.tsx`

---

## 1. Your four explicit instructions

| # | Instruction | Where | Action |
|---|---|---|---|
| 1 | Remove the **breadcrumb** `Home > Properties for Sale > Property Details` | `PropertyHeader`, lines 156–165 | Delete the whole `<nav>` block |
| 2 | Remove the **placeholder text in the subject field** | `ContactForm.tsx:145` | Drop `placeholder={t("contact.form.subject") \|\| "Subject"}` |
| 3 | **Do NOT add "Terms & Conditions"** | — | Not implementing it. The mockup has it; you don't want it. |
| 4 | **"Basic Amenities" = the category titles from "More Amenities"** (General, Bed and Bath, Dining, Facilities) **with their logos** | new sidebar card | Build from the same `sectionsMap` that feeds "More Amenities" |

**Keep** the "Interested in this Property?" contact heading and body — you confirmed those are correct.

---

## 2. Gap analysis: current vs. your mockup

| Area | Current | Mockup | Verdict |
|---|---|---|---|
| Breadcrumb | present | **absent** | remove (§1.1) |
| Gallery | 1 large image + thumbnail strip | 1 large left + **2 stacked right** | restructure (§4) |
| Title | `text-[16px] lg:text-[28px]` | ~`40px`, bold, dark green | enlarge (§3.1) |
| Subtitle line | address only | short tagline under title | keep address (§3.1) |
| Layout below gallery | **single column, stacked** | **2-column** — content left, sticky sidebar right | restructure (§3.2) |
| "About Property" | present ✓ | present | keep, restyle heading |
| Price card | full-width bar above gallery | inside sidebar "Property Information" | move (§5.1) |
| "Property Information" | **does not exist** | price, size, location, type, guests, beds, baths | **build** (§5.1) |
| "Basic Amenities" | **does not exist** | card of category titles + icons | **build** (§5.2) |
| "More Amenities" | present, grouped by category ✓ | same structure | keep, widen to 4 cols |
| "Terms & Conditions" | absent | present | **skip — not wanted** |
| Contact form | "Interested in this Property?" ✓ | "Schedule a Viewing" | keep heading (§1) |
| Subject placeholder | shows "Subject" | none | remove (§1.2) |

The single biggest visual gap is the **missing two-column layout** — the current page stacks everything full-width, while the mockup runs a ~62/35 split with a sticky sidebar.

---

## 3. Restructure the page shell

### 3.1 `PropertyHeader` — drop breadcrumb, enlarge title

```diff
  return (
    <header>
-      <nav className="flex items-center gap-1 text-[14px] ...">
-        <span className="relative grid size-5 place-items-center lg:size-6">
-          <Image src="/single-property/icon-home.svg" ... />
-        </span>
-        <Link href={href("/")}>{t("common.home")}</Link>
-        <span>&gt;</span>
-        <Link href={href("/buy")}>{t("buy.heroTitle")}</Link>
-        <span>&gt;</span>
-        <span className="text-[#292d32]">{t("buy.detailsBreadcrumb")}</span>
-      </nav>
-
-      <div className="mt-4 lg:mt-6">
-        <h1 className="text-[16px] font-semibold leading-6 ... lg:text-[28px] lg:font-medium lg:leading-[38px]">
+      <div>
+        <h1 className="text-[26px] font-bold leading-tight text-[#183c2f] lg:text-[40px]">
           {property.title}
         </h1>
```

After removing the breadcrumb, `Link`/`href` may become unused in `PropertyHeader` — check and clean.

### 3.2 Two-column shell

```tsx
<div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)] lg:gap-10">
  {/* LEFT — description + more amenities */}
  <div className="min-w-0">
    <DescriptionSection text={property.description} />
    <AmenitiesSection categoryValues={…} categories={categories} />
  </div>

  {/* RIGHT — sticky sidebar */}
  <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
    <PropertyInformationCard property={property} priceLabel={priceLabel} … />
    <BasicAmenitiesCard categoryValues={…} categories={categories} />
  </aside>
</div>
```

The gallery stays full-width above this, matching the mockup.

---

## 4. Gallery — 1 large + 2 stacked right

`PropertyImageGallery` is **shared** with the rental detail page, so **do not change it in place**.
Options:

- **(a) Add an optional `variant="mosaic"` prop** that renders the 1-large + 2-stacked layout and
  keeps the existing behaviour as the default. **Recommended** — no risk to the rent page.
- **(b)** Build a separate `PropertyMosaicGallery` component. Cleaner separation, more code.

Both need a "show all N photos" affordance — the mockup shows 3 tiles, but a listing may have 10
images, and the current component already has a fullscreen lightbox worth keeping.

Suggested `mosaic` markup:
```tsx
<div className="grid gap-3 sm:grid-cols-[1.6fr_1fr]">
  <button className="relative row-span-2 aspect-[16/10] overflow-hidden rounded-2xl">…main…</button>
  <button className="relative aspect-[16/5] overflow-hidden rounded-2xl">…2nd…</button>
  <button className="relative aspect-[16/5] overflow-hidden rounded-2xl">…3rd…</button>
</div>
```
Below `sm` it collapses to the existing single-image + strip.

---

## 5. The two new sidebar cards

Both need the grouped-category data. Extract the grouping currently inlined in `AmenitiesSection`
into a shared hook so all three consumers use one source of truth:

```tsx
// lib/hooks/useGroupedAmenities.ts
export function useGroupedAmenities(
  categoryValues: NonNullable<PropertyBuying["categoryValues"]>,
  categories: PropertyBuyingCategory[]
) {
  return useMemo(() => { /* the sectionsMap logic currently at lines 256–288 */ }, [categoryValues, categories]);
}
```

### 5.1 `PropertyInformationCard`

Mockup contents, in order:

| Row | Source |
|---|---|
| Price | `priceLabel` (existing `formatPriceForCurrency`) |
| Size | `${property.area} m²` |
| Location | `[street, area, city, country].filter(Boolean).join(", ")` |
| Spec chips | type (`propertyTypeId` → label), bedrooms, bathrooms |

```tsx
<article className="rounded-xl border border-[#dfe8e4] bg-white p-5">
  <div className="flex items-baseline justify-between gap-3">
    <p className="text-[20px] font-bold text-[#183c2f]">{priceLabel}</p>
    <p className="text-[13px] text-[#667c74]">{area} m²</p>
  </div>
  <p className="mt-3 flex items-start gap-2 text-[12.5px] text-[#667c74]">
    <MapPin … />{location}
  </p>
  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-[#eef2f0] pt-3">
    {chips.map(c => <span className="inline-flex items-center gap-1.5 text-[12px] text-[#40544c]">…</span>)}
  </div>
</article>
```

Move the `CurrencySelect` here too — it belongs next to the price.

### 5.2 `BasicAmenitiesCard` — categories, not items

Per your instruction this lists the **category titles with their logos** — i.e. the keys of the
grouped data, not the amenities inside them:

```tsx
<article className="mt-6 rounded-xl border border-[#dfe8e4] bg-white p-5">
  <h2 className="…text-[15px] font-bold text-[#183c2f]">{t("buy.basicAmenities")}</h2>
  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
    {groups.map(g => (
      <span className="flex items-center gap-2 text-[12.5px] text-[#40544c]">
        <DynamicAmenityIcon icon={g.categoryIcon} width={16} height={16} className="size-4 shrink-0 object-contain" />
        {g.categoryName}
      </span>
    ))}
  </div>
</article>
```

`categoryIcon` already resolves `category.defaultIcon || category.icon`, so the logos come free.
Return `null` when there are no groups, same as `AmenitiesSection` does today.

### 5.3 "More Amenities" stays

Keep `AmenitiesSection` as-is, but widen the item grid from `md:grid-cols-3` to `lg:grid-cols-4` to
match the mockup, and add the star icon to its heading.

---

## 6. Contact form — remove the subject placeholder

```diff
  <input
    name="subject"
    value={formData.subject}
-   placeholder={t("contact.form.subject") || "Subject"}
    className="…"
  />
```

⚠️ `ContactForm` is shared. Removing the placeholder affects **every** consumer — the contact page
and blog pages too. Since `defaultSubject` is pre-filled on this page, the placeholder was only
visible when that prop is empty. **Confirm you want it gone site-wide**, or I can make it opt-in via
a `hideSubjectPlaceholder` prop defaulting to `false`.

---

## 7. New i18n keys

```jsonc
"buy": {
  "basicAmenities": "Basic Amenities",
  "propertyInformation": "Property Information",
  "moreAmenities": "More Amenities",
  "aboutProperty": "About Property"
}
```

Add to all 5 locales. **Reminder:** `t()` returns the raw key when missing, so a missing key renders
literally — verify each resolves after adding.

---

## 8. Execution order

| Step | Scope | Risk |
|---|---|---|
| 1 | Remove breadcrumb + enlarge title (§3.1) | trivial |
| 2 | Remove subject placeholder (§6) — pending §9 confirmation | trivial |
| 3 | Extract `useGroupedAmenities` (§5) | low |
| 4 | Build `BasicAmenitiesCard` (§5.2) | low |
| 5 | Build `PropertyInformationCard` (§5.1) | low |
| 6 | Two-column shell (§3.2) | medium — restructure |
| 7 | Move price/currency into the sidebar | medium |
| 8 | Gallery mosaic variant (§4) | medium — shared component |
| 9 | i18n keys (§7) | trivial |

---

## 9. Open questions

1. **"2 Guests" has no data source.** The mockup's spec row shows `Villa | 2 Guests | 1 Bedroom |
   2 Bathroom`, but `PropertyBuying` has **no `capacity` field** — it exists on rent listings only.
   Options: **(a)** drop Guests for sale listings, **(b)** show floors/garage instead, **(c)** reuse
   `bedrooms`. **I recommend (a)** — a for-sale villa has no guest capacity.
2. **Subject placeholder site-wide?** (§6) Removing it affects the contact page and blog forms too.
3. **Gallery approach** — add a `variant` prop to the shared component (§4a), or a separate
   component (§4b)?
4. **Sticky sidebar** — should it stick on scroll? The mockup suggests a fixed-width right column;
   sticky is my inference.
5. **Design copy** — the mockup shows "Enjoy a luxurious place You can relax and unwind there." under
   the title and a "Schedule a Viewing" form body. Are those literal strings, or placeholders? I
   would **not** hardcode them — the subtitle should come from the listing, and the form keeps the
   existing "Interested in this Property?" copy you approved.

---

## 10. Verification

```bash
npm run lint
npm run build
```

Manual checks needed: breadcrumb gone at all locales; subject field shows the pre-filled value with
no ghost text; sidebar aligns with the design at `lg`/`xl`; "Basic Amenities" lists General / Bed and
Bath / Dining / Facilities with their icons and matches the "More Amenities" group headers exactly.