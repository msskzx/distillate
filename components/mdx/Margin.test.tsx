import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Margin } from "./Margin";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLElement;
let root: Root;
let wide = false;

beforeEach(() => {
  wide = false;
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: wide && query === "(min-width: 1024px)" }));
  container = document.createElement("article");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

function render(node: ReactNode) {
  act(() => root.render(node));
  return [...container.querySelectorAll<HTMLButtonElement>("button")];
}

const one = (
  <>
    <p>
      The annotated sentence.<Margin label="Extends">The gloss text.</Margin> The rest of it.
    </p>
    <p>The next paragraph.</p>
  </>
);

const notes = () => [...container.querySelectorAll('[role="note"]')];

describe("Margin", () => {
  it("renders the gloss text inside the paragraph for the margin layout", () => {
    render(one);
    expect(container.querySelector("p")!.textContent).toContain("The gloss text.");
  });

  it("renders no folded note until the marker is tapped", () => {
    const [marker] = render(one);
    expect(marker.getAttribute("aria-expanded")).toBe("false");
    expect(notes()).toHaveLength(0);
  });

  it("opens the note after the paragraph it annotates and closes it again", () => {
    const [marker] = render(one);
    act(() => marker.click());
    const [note] = notes();
    const [first, second] = container.querySelectorAll("p");
    expect(marker.getAttribute("aria-expanded")).toBe("true");
    expect(note.id).toBe(marker.getAttribute("aria-controls"));
    expect(note.textContent).toContain("The gloss text.");
    expect(first.contains(note)).toBe(false);
    expect(first.compareDocumentPosition(note) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(note.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    act(() => marker.click());
    expect(notes()).toHaveLength(0);
    expect(marker.getAttribute("aria-expanded")).toBe("false");
  });

  it("numbers and orders two notes in one paragraph by their markers, whichever opens first", () => {
    const [firstMarker, secondMarker] = render(
      <p>
        One.<Margin>First gloss.</Margin> Two.<Margin>Second gloss.</Margin>
      </p>,
    );
    act(() => secondMarker.click());
    act(() => firstMarker.click());
    expect(notes().map((note) => note.textContent)).toEqual(["1First gloss.", "2Second gloss."]);
  });

  it("does not open a folded note on a wide screen, where the gloss sits in the margin", () => {
    wide = true;
    const [marker] = render(one);
    act(() => marker.click());
    expect(notes()).toHaveLength(0);
    expect(marker.getAttribute("aria-expanded")).toBe("false");
  });

  it("names the note's label for screen readers", () => {
    expect(render(one)[0].getAttribute("aria-label")).toBe("Margin note: Extends");
  });
});
