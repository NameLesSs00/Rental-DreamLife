import { notFound } from "next/navigation";
import type { Metadata } from "next";
import LocationsContent from "../../../components/LocationsContent";

export const metadata: Metadata = {
  title: "Locations Management | Admin",
  description: "Create, edit, and manage geographical locations for properties.",
};

export default function LocationsPage() {
  // HIDDEN FOR THIS VERSION: Admin journey locations route disabled - comment out notFound() below to re-enable
  notFound();
  return <LocationsContent />;
}
