"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

const body = "text-[0.95rem] leading-[1.45] text-ink-soft [&_a]:text-accent";
const kind = "block tracking-[0.1em] text-accent [font-variant:all-small-caps]";
const wide = "(min-width: 1024px)";

export function Margin({ label, children }: { label?: string; children: ReactNode }) {
  const id = useId();
  const marker = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [slot, setSlot] = useState<{ holder: HTMLElement; number: number }>();

  useEffect(() => {
    const button = marker.current;
    if (!open || !button) return;
    const scope = button.closest("article") ?? document;
    const number = [...scope.querySelectorAll("[data-gloss-marker]")].indexOf(button) + 1;
    let after: Element = button.closest("p, li, td") ?? button;
    while (after.nextElementSibling instanceof HTMLElement && Number(after.nextElementSibling.dataset.glossSlot) < number) {
      after = after.nextElementSibling;
    }
    const holder = document.createElement("div");
    holder.dataset.glossSlot = String(number);
    after.after(holder);
    setSlot({ holder, number });
    return () => {
      holder.remove();
      setSlot(undefined);
    };
  }, [open]);

  return (
    <>
      <button
        ref={marker}
        type="button"
        data-gloss-marker=""
        aria-expanded={open}
        aria-controls={id}
        aria-label={`Margin note${label ? `: ${label}` : ""}`}
        onClick={() => {
          if (!matchMedia(wide).matches) setOpen(!open);
        }}
        className="cursor-pointer border-0 bg-transparent px-1 align-super text-[0.7em] leading-none text-accent [counter-increment:gloss] before:content-[counter(gloss)] lg:pointer-events-none lg:cursor-default before:[font-variant-numeric:lining-nums]"
      />
      <span className={`not-prose float-right clear-right -me-[16rem] mt-1 hidden w-[13.5rem] border-s border-accent ps-3 lg:block ${body}`}>
        <span className={kind}>
          <span className="before:content-[counter(gloss)] before:[font-variant-numeric:lining-nums]" />
          {label && ` ${label}`}
        </span>
        {children}
      </span>
      {slot &&
        createPortal(
          <div id={id} role="note" className={`not-prose -mt-2 mb-5 border-s border-accent bg-paper-deep px-3.5 py-2.5 lg:hidden ${body}`}>
            <span className={kind}>
              <span className="[font-variant-numeric:lining-nums]">{slot.number}</span>
              {label && ` ${label}`}
            </span>
            {children}
          </div>,
          slot.holder,
        )}
    </>
  );
}
