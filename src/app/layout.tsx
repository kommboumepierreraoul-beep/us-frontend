import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "US - Nous",
  description: "Plateforme premium de rencontres universitaires au Cameroun.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
