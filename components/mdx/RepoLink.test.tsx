import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { RepoLink } from "./RepoLink";

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  container.remove();
});

function renderStatic(element: Parameters<typeof renderToStaticMarkup>[0]) {
  container.innerHTML = renderToStaticMarkup(element);
  return container.querySelector("a");
}

describe("RepoLink", () => {
  it("links to the path on the main branch of the given repo on GitHub", () => {
    const link = renderStatic(<RepoLink repo="distillate" path="docs/plan.md" />);
    expect(link?.getAttribute("href")).toBe(
      "https://github.com/msskzx/distillate/blob/main/docs/plan.md",
    );
  });

  it("shows the path inside a code element as the link text when there are no children", () => {
    const link = renderStatic(<RepoLink repo="distillate" path="docs/plan.md" />);
    expect(link?.querySelector("code")?.textContent).toBe("docs/plan.md");
    expect(link?.textContent).toBe("docs/plan.md");
  });

  it("shows the children as the link text when children are given", () => {
    const link = renderStatic(
      <RepoLink repo="distillate" path="docs/plan.md">
        the plan
      </RepoLink>,
    );
    expect(link?.textContent).toBe("the plan");
    expect(link?.querySelector("code")).toBeNull();
  });
});
