import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { AdmissionsProvider } from "@/lib/admissions";

export const metadata: Metadata = {
  title: { default: "Shamim Akhtar College of Nursing & Midwifery", template: "%s | SACNM" },
  description: "Professional nursing and midwifery education at KORT, Mirpur, AJK.",
  icons: { icon: "/images/college-logo.jpg", apple: "/images/college-logo.jpg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AdmissionsProvider>
          <Navbar />
          <main>
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
        </AdmissionsProvider>
      </body>
    </html>
  );
}
