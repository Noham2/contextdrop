import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import { CookieBanner } from "./components/CookieBanner";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const BASE_URL = "https://contextdrop.fr";

export const metadata: Metadata = {
  title: "ContextDrop — Le brief client enfin simple",
  description:
    "Après ta visio, envoie un lien à ton client. Il valide ce que vous avez dit en 5 minutes. Tu reçois un brief signé, prêt pour ton devis.",
  metadataBase: new URL(BASE_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: BASE_URL,
    title: "ContextDrop — Le brief client enfin simple",
    description:
      "Après ta visio, envoie un lien à ton client. Il valide ce que vous avez dit en 5 minutes. Tu reçois un brief signé, prêt pour ton devis.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ContextDrop — Brief client IA",
      },
    ],
    siteName: "ContextDrop",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "ContextDrop — Le brief client enfin simple",
    description:
      "Après ta visio, envoie un lien à ton client. Il valide ce que vous avez dit en 5 minutes. Tu reçois un brief signé.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Anti-FOUC: apply saved theme before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme')||'light';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${dmSans.variable} ${instrumentSerif.variable}`}>
        <ThemeProvider>{children}</ThemeProvider>
        <CookieBanner />
      </body>
    </html>
  );
}
