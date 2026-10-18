import { notFound } from "next/navigation";
import type { Metadata } from "next";
import AdminTransferBookingDetailsContent from "@/components/AdminTransferBookingDetailsContent";

export const metadata: Metadata = {
  title: "Transfer Booking Details | Admin",
  description: "View transfer booking details and payment status.",
};

export default async function AdminTransferBookingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  // HIDDEN FOR THIS VERSION: Admin transfer booking details route disabled - comment out notFound() below to re-enable
  notFound();
  const resolvedParams = await params;
  return <AdminTransferBookingDetailsContent id={resolvedParams.id} />;
}
