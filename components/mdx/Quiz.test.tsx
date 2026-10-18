import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Quiz } from "./Quiz";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const base = {
  question: "Which option is correct?",
  options: ["Alpha", "Beta", "Gamma"],
  answer: 2,
  right: "Right answer text",
  wrong: "Wrong answer text",
};

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

function render(element: ReactElement) {
  act(() => root.render(element));
}

function optionButtons() {
  return Array.from(container.querySelectorAll("button"));
}

function click(button: HTMLButtonElement) {
  act(() => button.click());
}

describe("Quiz", () => {
  it("shows the default title Retrieval when no title is given", () => {
    render(<Quiz {...base} />);
    expect(container.textContent).toContain("Retrieval");
  });

  it("shows the given title instead of the default when one is provided", () => {
    render(<Quiz {...base} title="Check yourself" />);
    expect(container.textContent).toContain("Check yourself");
    expect(container.textContent).not.toContain("Retrieval");
  });

  it("shows the question and one button per option, in order", () => {
    render(<Quiz {...base} />);
    expect(container.textContent).toContain(base.question);
    expect(optionButtons().map((button) => button.textContent)).toEqual(["Alpha", "Beta", "Gamma"]);
  });

  it("shows no feedback text and leaves every option enabled before any click", () => {
    render(<Quiz {...base} />);
    expect(container.textContent).not.toContain(base.right);
    expect(container.textContent).not.toContain(base.wrong);
    expect(optionButtons().every((button) => !button.disabled)).toBe(true);
  });

  it("shows the right text after clicking the correct option", () => {
    render(<Quiz {...base} />);
    click(optionButtons()[1]);
    expect(container.textContent).toContain(base.right);
    expect(container.textContent).not.toContain(base.wrong);
  });

  it("shows the wrong text after clicking a wrong option", () => {
    render(<Quiz {...base} />);
    click(optionButtons()[0]);
    expect(container.textContent).toContain(base.wrong);
    expect(container.textContent).not.toContain(base.right);
  });

  it("disables every option button after a correct click", () => {
    render(<Quiz {...base} />);
    click(optionButtons()[1]);
    expect(optionButtons().every((button) => button.disabled)).toBe(true);
  });

  it("disables every option button after a wrong click", () => {
    render(<Quiz {...base} />);
    click(optionButtons()[0]);
    expect(optionButtons().every((button) => button.disabled)).toBe(true);
  });

  it("keeps the first feedback unchanged when a second option is clicked after a wrong click", () => {
    render(<Quiz {...base} />);
    click(optionButtons()[0]);
    click(optionButtons()[1]);
    expect(container.textContent).toContain(base.wrong);
    expect(container.textContent).not.toContain(base.right);
  });

  it("marks the correct option green and the clicked wrong option red after a wrong click", () => {
    render(<Quiz {...base} />);
    click(optionButtons()[0]);
    const [clicked, correct, other] = optionButtons();
    expect(correct.className).toMatch(/green/);
    expect(clicked.className).toMatch(/red/);
    expect(other.className).not.toMatch(/green|red/);
  });
});
