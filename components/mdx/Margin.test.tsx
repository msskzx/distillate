import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Margin } from "./Margin";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

function render() {
  act(() =>
    root.render(
      <>
        <p>
          The annotated sentence.<Margin label="Extends">The gloss text.</Margin> The rest of it.
        </p>
        <p>The next paragraph.</p>
      </>,
    ),
  );
  return container.querySelector<HTMLButtonElement>("button")!;
}

describe("Margin", () => {
  it("keeps the gloss beside the paragraph for wide screens", () => {
    render();
    expect(container.querySelector("p")!.textContent).toContain("The gloss text.");
  });

  it("starts folded on narrow screens", () => {
    const marker = render();
    expect(marker.getAttribute("aria-expanded")).toBe("false");
    expect(container.querySelector('[role="note"]')).toBeNull();
  });

  it("opens the note after the paragraph it annotates and closes it again", () => {
    const marker = render();
    act(() => marker.click());
    const note = container.querySelector('[role="note"]')!;
    const [first, second] = container.querySelectorAll("p");
    expect(marker.getAttribute("aria-expanded")).toBe("true");
    expect(note.id).toBe(marker.getAttribute("aria-controls"));
    expect(note.textContent).toContain("The gloss text.");
    expect(first.contains(note)).toBe(false);
    expect(first.compareDocumentPosition(note) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(note.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    act(() => marker.click());
    expect(container.querySelector('[role="note"]')).toBeNull();
    expect(marker.getAttribute("aria-expanded")).toBe("false");
  });

  it("names the note's label for screen readers", () => {
    expect(render().getAttribute("aria-label")).toBe("Margin note: Extends");
  });
});
