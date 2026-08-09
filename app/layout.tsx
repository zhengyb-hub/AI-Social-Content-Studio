import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";
  const imageUrl = host ? `${protocol}://${host}/og-solution-marketing-zh.png` : undefined;

  return {
    title: "EchoFlow｜AI 解决方案营销工作台",
    description: "面向智慧城市与数字政务场景的 AI 辅助解决方案营销、人工审核、内容复用与工作流分析工具。",
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      title: "EchoFlow｜AI 解决方案营销工作台",
      description: "将复杂的智慧城市与数字政务方案转化为面向不同关键角色的专业内容。",
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: "EchoFlow｜AI 解决方案营销工作台",
      description: "将复杂的智慧城市与数字政务方案转化为面向不同关键角色的专业内容。",
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
