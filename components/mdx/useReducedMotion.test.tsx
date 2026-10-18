import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useReducedMotion } from "./useReducedMotion";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const originalMatchMedia = window.matchMedia;
let container: HTMLDivElement;
let root: Root;

function stubMatchMedia(matches: boolean) {
  const queries: string[] = [];
  window.matchMedia = (query: string) => {
    queries.push(query);
    return {
      matches,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    } as MediaQueryList;
  };
  return queries;
}

function Probe() {
  return <span>{String(useReducedMotion())}</span>;
}

function renderProbe() {
  act(() => root.render(<Probe />));
  return container.textContent;
}

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  window.matchMedia = originalMatchMedia;
});

describe("useReducedMotion", () => {
  it("returns true when the reduce-motion media query matches", () => {
    stubMatchMedia(true);
    expect(renderProbe()).toBe("true");
  });

  it("returns false when the reduce-motion media query does not match", () => {
    stubMatchMedia(false);
    expect(renderProbe()).toBe("false");
  });

  it("queries the prefers-reduced-motion reduce media query", () => {
    const queries = stubMatchMedia(false);
    renderProbe();
    expect(queries).toContain("(prefers-reduced-motion: reduce)");
  });
});
