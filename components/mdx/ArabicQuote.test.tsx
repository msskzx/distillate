import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ArabicQuote } from "./ArabicQuote";

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  container.remove();
});

describe("ArabicQuote", () => {
  it("renders a blockquote with dir rtl and lang ar", () => {
    container.innerHTML = renderToStaticMarkup(<ArabicQuote>نص</ArabicQuote>);
    const quote = container.querySelector("blockquote");
    expect(quote).not.toBeNull();
    expect(quote?.getAttribute("dir")).toBe("rtl");
    expect(quote?.getAttribute("lang")).toBe("ar");
  });

  it("renders the children inside the blockquote", () => {
    container.innerHTML = renderToStaticMarkup(
      <ArabicQuote>
        <span>إنما الأعمال بالنيات</span>
      </ArabicQuote>,
    );
    expect(container.querySelector("blockquote")?.textContent).toBe("إنما الأعمال بالنيات");
  });
});
