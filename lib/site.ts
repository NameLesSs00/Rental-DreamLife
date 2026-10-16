export const siteConfig = {
  name: "dreamlifehurghada",
  description:
    "Discover and book verified vacation homes, holiday apartments, beach chalets, studios, and private airport transfers in Hurghada with local host support.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://dreamlife@gmail.com",
  locale: "en_US",
  phone: "+201000000000",
  displayPhone: "+20 10000000000",
  email: "dreamlife@gmail.com",
  whatsappUrl: "https://wa.me/0000000000",
  address: {
    streetAddress: "El Kawther",
    addressLocality: "Hurghada",
    addressRegion: "Red Sea Governorate",
    addressCountry: "EG",
    label: "Hurghada",
  },
  logo: "/logo.svg",
  ogImage: "/logo.svg",
};

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}
