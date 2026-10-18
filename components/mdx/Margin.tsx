"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

const body = "text-[0.95rem] leading-[1.45] text-ink-soft [&_a]:text-accent";

export function Margin({ label, children }: { label?: string; children: ReactNode }) {
  const id = useId();
  const marker = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [slot, setSlot] = useState<HTMLElement>();

  useEffect(() => {
    if (!open || !marker.current) return;
    const anchor = marker.current.closest("p, li, td") ?? marker.current;
    const holder = document.createElement("div");
    anchor.after(holder);
    setSlot(holder);
    return () => {
      holder.remove();
      setSlot(undefined);
    };
  }, [open]);

  const heading = (
    <span className="block tracking-[0.1em] text-accent [font-variant:all-small-caps]">
      <span className="before:content-[counter(gloss)] before:[font-variant-numeric:lining-nums]" />
      {label && ` ${label}`}
    </span>
  );

  return (
    <>
      <button
        ref={marker}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        aria-label={`Margin note${label ? `: ${label}` : ""}`}
        onClick={() => setOpen(!open)}
        className="cursor-pointer border-0 bg-transparent px-1 align-super text-[0.7em] leading-none text-accent [counter-increment:gloss] before:content-[counter(gloss)] before:[font-variant-numeric:lining-nums] lg:cursor-default"
      />
      <span className={`not-prose float-right clear-right -me-[16rem] mt-1 hidden w-[13.5rem] border-s border-accent ps-3 lg:block ${body}`}>
        {heading}
        {children}
      </span>
      {slot &&
        createPortal(
          <div id={id} role="note" className={`not-prose -mt-2 mb-5 border-s border-accent bg-paper-deep px-3.5 py-2.5 lg:hidden ${body}`}>
            {heading}
            {children}
          </div>,
          slot,
        )}
    </>
  );
}
