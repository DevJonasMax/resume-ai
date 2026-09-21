import type { Metadata } from "next";
import React from "react";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/index.js";

export const metadata: Metadata = {
  title: "AI Job Application Agent",
  description: "Autonomous agent for job requirements extraction, LaTeX resume tailoring, and browser navigation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className="min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200"
        suppressHydrationWarning
      >
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
