import type { Metadata } from "next";
import NavBar from "./NavBar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Voice Cashier | Spill the Beans",
  description: "AI voice cashier for Spill the Beans coffee shop",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <NavBar />
        <main className="page-content">{children}</main>
      </body>
    </html>
  );
}
