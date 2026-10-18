import { act, type ReactNode, type ComponentType } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { components, slugify } from "./mdx-components";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const H2 = components.h2 as unknown as ComponentType<{ children?: ReactNode }>;

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

describe("slugify", () => {
  it("lowercases the text and joins its words with hyphens", () => {
    expect(slugify("The move worth stealing!")).toBe("the-move-worth-stealing");
  });

  it("turns each run of non-alphanumeric characters into a single hyphen", () => {
    expect(slugify("Hello,  -- world")).toBe("hello-world");
  });

  it("keeps digits", () => {
    expect(slugify("Version 2.0 notes")).toBe("version-2-0-notes");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("  --Trimmed!!  ")).toBe("trimmed");
  });

  it("drops non-Latin characters, leaving the Latin words around them", () => {
    expect(slugify("مرحبا world")).toBe("world");
  });
});

describe("components.h2", () => {
  it("renders an h2 element", () => {
    act(() => root.render(<H2>Plain title</H2>));
    expect(container.querySelector("h2")?.textContent).toBe("Plain title");
  });

  it("sets the id to the slugified text of its children", () => {
    act(() => root.render(<H2>The move worth stealing!</H2>));
    expect(container.querySelector("h2")?.id).toBe("the-move-worth-stealing");
  });

  it("slugifies text nested inside an inline code element", () => {
    act(() =>
      root.render(
        <H2>
          Use <code>useState</code> wisely
        </H2>,
      ),
    );
    expect(container.querySelector("h2")?.id).toBe("use-usestate-wisely");
  });
});
