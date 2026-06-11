import type { Metadata } from "next";
import Image from "next/image";
import "./styles.css";

export const metadata: Metadata = {
  title: "Certifyd Network Map",
  description: "Discover sovereign Certifyd node providers and review readiness, trust, and service capability.",
  icons: [{ rel: "icon", url: "/favicon.svg" }]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="siteHeader">
          <a className="brand" href="/" aria-label="Certifyd Network Map home">
            <Image src="/favicon.svg" alt="" width={38} height={38} priority />
            <span>Certifyd Network</span>
          </a>
          <nav aria-label="Primary navigation">
            <a href="/">Map</a>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
