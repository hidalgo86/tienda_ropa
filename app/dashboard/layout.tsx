import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import DashboardLayoutClient from "./DashboardLayoutClient";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="hidden lg:block">
        <Navbar />
      </div>
      <DashboardLayoutClient>{children}</DashboardLayoutClient>
    </>
  );
}
