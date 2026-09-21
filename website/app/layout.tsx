import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://your-project.vercel.app";

export const metadata: Metadata = {
  title: "Tibo — see what your coding agent decided",
  description: "A local-first CLI that surfaces unapproved decisions in your coding agent's diff.",
  metadataBase: new URL(siteUrl),
  openGraph: { title: "Tibo — see what your coding agent decided", description: "Reads your diff. Names what the agent decided on its own. Keeps a ledger of what you confirm.", images: ["/og.png"] },
  twitter: { card: "summary_large_image", title: "Tibo — see what your coding agent decided", images: ["/og.png"] },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg", apple: "/logo.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
