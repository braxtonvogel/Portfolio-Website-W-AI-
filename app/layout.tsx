import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Braxton Vogel Portfolio",
  description: "Software Engineering Portfolio",
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
      </body>
    </html>
  );
}