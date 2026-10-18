"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export type IndexGroup = { label: string; links: { href: string; label: string; number?: number }[] };

const wide = 1280;

const button =
  "rounded-sm border border-rule bg-transparent px-3 py-0.5 text-[0.95rem] text-ink-soft hover:border-accent hover:text-accent";
const link = "flex gap-2 py-0.5 leading-snug text-ink hover:text-accent";
const current = "text-accent";
const heading = "mb-1.5 mt-5 text-[0.9rem] tracking-[0.12em] text-accent [font-variant:all-small-caps] first:mt-0";
const numeral = "w-5 flex-none text-end text-ink-soft [font-variant-numeric:lining-nums_tabular-nums]";

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
  const [sections, setSections] = useState<{ id: string; label: string; number: string }[]>([]);

  useEffect(() => {
    const stored = recall("lessonIndex");
    setOpen(innerWidth >= wide && (stored ?? "open") === "open");
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  useEffect(() => {
    if (innerWidth < wide) setOpen(false);
    setSections(
      [...document.querySelectorAll<HTMLHeadingElement>("main h2[id]")].map((h, i) => ({
        id: h.id,
        label: h.dataset.label ?? h.textContent ?? "",
        number: h.dataset.number ?? String(i + 1),
      })),
    );
  }, [path]);

  useEffect(() => {
    document.documentElement.dataset.index = open ? "open" : "closed";
  }, [open]);

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
      <div className="fixed inset-x-0 top-0 z-20 flex items-center justify-between gap-2 border-b border-rule bg-paper/95 px-4 py-2.5 print:hidden">
        <div className="flex gap-2">
          <button type="button" aria-controls="index" aria-expanded={open} onClick={toggleIndex} className={button}>
            Contents
          </button>
          <Link href="/" className={`${button} flex items-center gap-2`}>
            <Image src="/logo.png" alt="" width={18} height={18} className="rounded-[3px]" priority />
            Distillate
          </Link>
        </div>
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
          className={button}
        >
          {dark ? "☀" : "☾"}
        </button>
      </div>
      <nav
        id="index"
        aria-label="Lesson index"
        className={`fixed bottom-0 start-0 top-[3.25rem] z-10 w-64 overflow-y-auto border-e border-rule bg-paper px-4 pb-8 pt-5 text-base print:hidden ${open ? "" : "hidden"}`}
      >
        {groups.map((group) => (
          <div key={group.label}>
            <p className={heading}>{group.label}</p>
            <ol className="m-0 list-none p-0">
              {group.links.map((each) => (
                <li key={each.href}>
                  <Link
                    href={each.href}
                    aria-current={each.href === path ? "page" : undefined}
                    className={`${link} ${each.href === path ? current : ""}`}
                  >
                    <span className={numeral}>{each.href === path ? "❧" : each.number}</span>
                    <span className={each.number === undefined ? "italic" : undefined}>{each.label}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        ))}
        {sections.length > 0 && (
          <div>
            <p className={heading}>On this page</p>
            <ol className="m-0 list-none p-0">
              {sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className={link}>
                    <span className={numeral}>{section.number}</span>
                    <span>{section.label}</span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        )}
      </nav>
    </>
  );
}
