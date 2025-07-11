import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "../providers/providers";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../lib/auth";
import { NProgressProvider } from "@/providers/nprogress-provider";
import { AuthenticatedLayout } from "./authenticated-layout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JEM CDYN, Dev.",
  description: "Generated by create next app",
  icons: {
    icon: "/nextjs.png",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}>
        <Providers session={session}>
          <NProgressProvider />
          {/* Use client side session-aware layout */}
          <AuthenticatedLayout>{children}</AuthenticatedLayout>
        </Providers>
      </body>
    </html>
  );
}
