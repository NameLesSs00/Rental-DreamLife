import type { Metadata } from "next";
import AdminDashboardContent from "../../../components/AdminDashboardContent";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Sea Key Property admin dashboard.",
};

export default function AdminDashboardPage() {
  return <AdminDashboardContent />;
}
