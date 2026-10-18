import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Chrome } from "@/components/lesson/Chrome";
import { tracks } from "@/lib/content";
import { amiri, garamond, plexMono } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Distillate", template: "%s · Distillate" },
  description: "Lessons and records of what agents learned while working.",
};

const theme = `try{var t=localStorage.getItem('lessonTheme');document.documentElement.classList.toggle('dark',t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches)}catch(e){document.documentElement.classList.toggle('dark',matchMedia('(prefers-color-scheme: dark)').matches)}`;

export default async function RootLayout({ children }: { children: ReactNode }) {
  const groups = (await tracks()).map((track) => ({
    label: track.meta.title,
    links: [
      { href: track.href, label: "About this track" },
      ...track.lessons.map((lesson) => ({
        href: lesson.href,
        label: lesson.meta.label ?? lesson.meta.title,
        number: lesson.meta.number,
      })),
      ...track.pages.map((page) => ({ href: page.href, label: page.meta.title })),
    ],
  }));
  groups.push({ label: "Records", links: [{ href: "/records", label: "All records" }] });

  return (
    <html lang="en" suppressHydrationWarning className={`${garamond.variable} ${amiri.variable} ${plexMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: theme }} />
      </head>
      <body className="bg-paper font-serif text-ink antialiased">
        <Chrome groups={groups} />
        {children}
      </body>
    </html>
  );
}
