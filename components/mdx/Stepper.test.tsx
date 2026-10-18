import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Stepper } from "./Stepper";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  delete (window as { matchMedia?: unknown }).matchMedia;
});

function render(element: ReactElement) {
  act(() => root.render(element));
}

function buttonWithText(text: string) {
  return Array.from(container.querySelectorAll("button")).find((button) =>
    button.textContent?.includes(text),
  );
}

function clickButton(text: string) {
  const button = buttonWithText(text);
  if (!button) throw new Error(`no button containing ${text}`);
  act(() => button.click());
}

function threeSteps() {
  return (
    <Stepper>
      <p>First step</p>
      <p>Second step</p>
      <p>Third step</p>
    </Stepper>
  );
}

describe("Stepper", () => {
  it("shows only the first child before any click", () => {
    render(threeSteps());
    expect(container.textContent).toContain("First step");
    expect(container.textContent).not.toContain("Second step");
    expect(container.textContent).not.toContain("Third step");
  });

  it("reveals exactly one more child per Next step click", () => {
    render(threeSteps());
    clickButton("Next step");
    expect(container.textContent).toContain("Second step");
    expect(container.textContent).not.toContain("Third step");
    clickButton("Next step");
    expect(container.textContent).toContain("Third step");
  });

  it("shows the shown count and total in the Next step label, like (1/3)", () => {
    render(threeSteps());
    expect(buttonWithText("Next step")?.textContent).toContain("(1/3)");
    clickButton("Next step");
    expect(buttonWithText("Next step")?.textContent).toContain("(2/3)");
  });

  it("disables Next step once every child is shown", () => {
    render(threeSteps());
    clickButton("Next step");
    clickButton("Next step");
    const next = buttonWithText("Next step");
    expect(next?.textContent).toContain("(3/3)");
    expect(next?.disabled).toBe(true);
  });

  it("hides the last revealed child when Back is clicked", () => {
    render(threeSteps());
    clickButton("Next step");
    clickButton("Next step");
    clickButton("Back");
    expect(container.textContent).toContain("Second step");
    expect(container.textContent).not.toContain("Third step");
  });

  it("disables Back when only one child is shown", () => {
    render(threeSteps());
    expect(buttonWithText("Back")?.disabled).toBe(true);
  });

  it("enables Back once a second child is revealed", () => {
    render(threeSteps());
    clickButton("Next step");
    expect(buttonWithText("Back")?.disabled).toBe(false);
  });
});
