import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PrLinks } from "./PrLinks";

describe("PrLinks", () => {
  it("links PR numbers to the named project, or the record's own", () => {
    const div = document.createElement("div");
    div.innerHTML = renderToStaticMarkup(<PrLinks text="Namaq PR #524 at c63; distillate PR #4 and #9." project="namaq" />);
    expect([...div.querySelectorAll("a")].map((a) => [a.textContent, a.getAttribute("href")])).toEqual([
      ["Namaq PR #524", "https://github.com/msskzx/namaq/pull/524"],
      ["distillate PR #4", "https://github.com/msskzx/distillate/pull/4"],
      ["#9", "https://github.com/msskzx/namaq/pull/9"],
    ]);
    expect(div.textContent).toBe("Namaq PR #524 at c63; distillate PR #4 and #9.");
  });
});
