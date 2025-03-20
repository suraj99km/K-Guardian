import type { Metadata } from "next";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "K-Guardian",
  description: "Vigilance, Safety, Action",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="relative">
        <Toaster position="top-right" richColors closeButton />
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}