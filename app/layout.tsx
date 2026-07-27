import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";
  const imageUrl = host ? `${protocol}://${host}/og.png` : undefined;

  return {
    title: "EchoFlow｜AI 内容运营台",
    description: "根据用户标签自动生成、质检和审核多平台社交媒体文案。",
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      title: "EchoFlow｜AI 内容运营台",
      description: "把标签变成内容，把内容变成增长。",
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: "EchoFlow｜AI 内容运营台",
      description: "把标签变成内容，把内容变成增长。",
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
