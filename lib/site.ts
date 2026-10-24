export const siteConfig = {
  name: "Sea Key Property",
  fullName: "Sea Key Property Rentals & Trips",
  description:
    "Discover and book verified vacation homes, holiday apartments, beach chalets, studios, and private Red Sea excursions & airport transfers in Hurghada with Sea Key Property.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://seakeyproperty.com",
  locale: "en_US",
  phone: "+201068544908",
  displayPhone: "+20 10 68544908",
  email: "info@seakeyproperty.com",
  whatsappUrl: "https://wa.me/201068544908",
  address: {
    streetAddress: "Al-Kawthar Street, above the Metro, Al-Safra Al-Shamiya",
    addressLocality: "Hurghada",
    addressRegion: "Red Sea Governorate",
    addressCountry: "EG",
    label: "Al-Kawthar Street, above the Metro, Al-Safra Al-Shamiya, Hurghada",
  },
  logo: "/logo.svg",
  ogImage: "/og-image.jpg",
};

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}
