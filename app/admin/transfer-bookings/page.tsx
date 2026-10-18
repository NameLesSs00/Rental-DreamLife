import { notFound } from "next/navigation";
import type { Metadata } from "next";
import AdminTransferBookingsContent from "@/components/AdminTransferBookingsContent";

export const metadata: Metadata = {
  title: "Transfer Bookings | Admin",
  description: "View and filter transfer bookings.",
};

export default function AdminTransferBookingsPage() {
  // HIDDEN FOR THIS VERSION: Admin transfer bookings route disabled - comment out notFound() below to re-enable
  notFound();
  return <AdminTransferBookingsContent />;
}
