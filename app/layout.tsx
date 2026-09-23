import "./globals.css";
import type { Metadata } from "next";
import FakeAI from "@/components/FakeAI";
import CustomCursor from "@/components/CustomCursor";

const SITE_URL = "https://braxton-vogel.vercel.app";
const SITE_TITLE = "Braxton Vogel Portfolio";
const SITE_DESCRIPTION = "Software Engineering Portfolio";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_TITLE,
    images: [{ url: "/Brax_Prof_Pic.jpg", width: 280, height: 280 }],
  },
  twitter: {
    card: "summary",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/Brax_Prof_Pic.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-black dark:bg-black dark:text-white">
        {children}
        <FakeAI />
        <CustomCursor />
      </body>
    </html>
  );
}