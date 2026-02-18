import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RepoToViralVideo — Turn any GitHub repo into a viral video",
  description: "Generate viral promo videos for any GitHub repository with AI. Kinetic typography, animated stats, AI voiceover — all automated.",
  openGraph: {
    title: "RepoToViralVideo",
    description: "Turn any GitHub repo into a viral promo video — automatically.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
