import { notFound } from "next/navigation";
import type { Metadata } from "next";
import JourneysContent from "../../../components/JourneysContent";

export const metadata: Metadata = {
  title: "Journeys Management | Admin",
  description: "Create, edit, and manage journeys and route pricing.",
};

export default function JourneysPage() {
  // HIDDEN FOR THIS VERSION: Admin journeys route disabled - comment out notFound() below to re-enable
  notFound();
  return <JourneysContent />;
}
