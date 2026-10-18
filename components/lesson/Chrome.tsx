"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export type IndexGroup = { label: string; links: { href: string; label: string }[] };

const wide = 1280;

const button =
  "rounded border border-stone-300 bg-stone-50/90 px-3 py-1.5 text-stone-600 backdrop-blur hover:border-amber-500 hover:text-amber-700 dark:border-stone-700 dark:bg-stone-950/90 dark:text-stone-400 dark:hover:text-amber-400";
const link =
  "block rounded px-2 py-1 text-sm text-stone-600 hover:bg-amber-100 hover:text-amber-900 dark:text-stone-400 dark:hover:bg-amber-950 dark:hover:text-amber-200";
const current = "bg-amber-100 font-semibold text-amber-900 dark:bg-amber-950 dark:text-amber-200";
const heading = "mb-1 mt-4 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-amber-700 dark:text-amber-500";

function recall(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function remember(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

export function Chrome({ groups }: { groups: IndexGroup[] }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [sections, setSections] = useState<{ id: string; label: string }[]>([]);

  useEffect(() => {
    const stored = recall("lessonIndex");
    setOpen(innerWidth >= wide && (stored ?? "open") === "open");
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  useEffect(() => {
    if (innerWidth < wide) setOpen(false);
    setSections(
      [...document.querySelectorAll<HTMLHeadingElement>("main h2[id]")].map((h) => ({
        id: h.id,
        label: h.textContent ?? "",
      })),
    );
  }, [path]);

  const toggleIndex = () => {
    remember("lessonIndex", open ? "closed" : "open");
    setOpen(!open);
  };

  const toggleTheme = () => {
    const next = document.documentElement.classList.toggle("dark");
    remember("lessonTheme", next ? "dark" : "light");
    setDark(next);
  };

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-20 flex items-start justify-between gap-2 p-3 print:hidden">
        <div className="flex gap-2">
          <button
            type="button"
            aria-controls="index"
            aria-expanded={open}
            onClick={toggleIndex}
            className={`${button} font-mono text-xs uppercase tracking-wider`}
          >
            Index
          </button>
          <Link href="/" className={`${button} font-mono text-xs uppercase tracking-wider`}>
            Home
          </Link>
        </div>
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
          className={`${button} text-sm`}
        >
          {dark ? "☀" : "☾"}
        </button>
      </div>
      <nav
        id="index"
        aria-label="Lesson index"
        className={`fixed inset-y-0 start-0 z-10 w-64 overflow-y-auto border-e border-stone-200 bg-stone-100/95 px-3 pb-8 pt-16 backdrop-blur dark:border-stone-800 dark:bg-stone-900/95 print:hidden ${open ? "" : "hidden"}`}
      >
        {groups.map((group) => (
          <div key={group.label}>
            <p className={heading}>{group.label}</p>
            {group.links.map((each) => (
              <Link key={each.href} href={each.href} className={`${link} ${each.href === path ? current : ""}`}>
                {each.label}
              </Link>
            ))}
          </div>
        ))}
        {sections.length > 0 && (
          <div>
            <p className={heading}>On this page</p>
            {sections.map((section) => (
              <a key={section.id} href={`#${section.id}`} className={link}>
                {section.label}
              </a>
            ))}
          </div>
        )}
      </nav>
    </>
  );
}
