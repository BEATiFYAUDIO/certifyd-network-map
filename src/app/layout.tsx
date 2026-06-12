import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "./styles.css";

export const metadata: Metadata = {
  title: "Certifyd Network Map",
  description: "Discover eligible sovereign Certifyd nodes and review readiness, trust, and service capability.",
  icons: [{ rel: "icon", url: "/favicon.svg" }]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="siteHeader">
          <Link className="brand" href="/" aria-label="Certifyd Network Map home">
            <Image className="brandLogo" src="/certifyd-logo.svg" alt="Certifyd" width={124} height={40} priority />
            <span>Network</span>
          </Link>
          <nav aria-label="Primary navigation">
            <Link href="/">Map</Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
