import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";
  const imageUrl = host ? `${protocol}://${host}/og-solution-marketing.png` : undefined;

  return {
    title: "EchoFlow | AI Solution Marketing Studio",
    description: "AI-assisted stakeholder messaging, content review, reuse tracking and workflow analytics for B2B and B2G solution marketing.",
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      title: "EchoFlow | AI Solution Marketing Studio",
      description: "Turn complex smart-city solutions into stakeholder-ready, evidence-conscious content.",
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: "EchoFlow | AI Solution Marketing Studio",
      description: "Turn complex smart-city solutions into stakeholder-ready, evidence-conscious content.",
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
