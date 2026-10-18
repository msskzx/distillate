import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { IndexedRecord } from "@/lib/search";
import { RecordSearch } from "./RecordSearch";

const nav = vi.hoisted(() => ({
  currentSearch: "",
  replace: vi.fn((url: string) => {
    nav.currentSearch = url.split("?")[1] ?? "";
  }),
  paramsCache: new Map<string, URLSearchParams>(),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => {
    let params = nav.paramsCache.get(nav.currentSearch);
    if (!params) {
      params = new URLSearchParams(nav.currentSearch);
      nav.paramsCache.set(nav.currentSearch, params);
    }
    return params;
  },
  usePathname: () => "/records",
  useRouter: () => ({ replace: nav.replace }),
}));

vi.mock("next/link", async () => {
  const React = await import("react");
  return {
    default: ({ href, children, ...rest }: { href: string; children?: React.ReactNode }) =>
      React.createElement("a", { ...rest, href }, children),
  };
});

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const detour: IndexedRecord = {
  id: "distillate/0001-alias",
  project: "distillate",
  slug: "0001-alias",
  href: "/records/distillate/0001-alias",
  url: "https://example.test/records/distillate/0001-alias",
  title: "Alias missing in Vitest",
  summary: "Vitest could not resolve the at-sign alias.",
  disclosure: "open",
  sourceProject: "distillate",
  kind: "detour",
  problem: "Vitest could not resolve the @ alias",
  approach: "Added the alias to the Vitest config.",
  outcome: "solved",
  conditions: "jsdom environment",
  evidence: "The suite passed after the change.",
  implication: "Aliases belong in the test config.",
  date: "2026-03-01",
  topics: ["testing"],
  buildsOn: [],
  variantOf: [],
  text: "Vitest could not resolve the @ alias. Added the alias to the Vitest config.",
};

const obstacle: IndexedRecord = {
  id: "namaq/0002-layout",
  project: "namaq",
  slug: "0002-layout",
  href: "/records/namaq/0002-layout",
  url: "https://example.test/records/namaq/0002-layout",
  title: "Graph layout on resize",
  summary: "The force graph moved on every resize.",
  disclosure: "open",
  sourceProject: "namaq",
  kind: "obstacle",
  problem: "Force layout jitters on resize",
  approach: "Still investigating the resize handler.",
  outcome: "open",
  conditions: "Browser window resized repeatedly.",
  evidence: "Screen recording of the jitter.",
  implication: "Layout should be frozen during resize.",
  date: "2026-05-10",
  topics: ["graph-ui", "testing"],
  buildsOn: [],
  variantOf: [],
  text: "Force layout jitters on resize. Still investigating the resize handler.",
};

const challenge: IndexedRecord = {
  id: "namaq/0003-sync",
  project: "namaq",
  slug: "0003-sync",
  href: "/records/namaq/0003-sync",
  url: "https://example.test/records/namaq/0003-sync",
  title: "Duplicate rows after sync",
  summary: "A second sync run duplicated rows.",
  disclosure: "generic",
  sourceProject: "namaq",
  kind: "challenge",
  problem: "Sync wrote duplicate rows",
  approach: "Keyed the upsert on the slug.",
  outcome: "solved",
  conditions: "Re-running the sync script.",
  evidence: "Row counts matched after two runs.",
  implication: "Sync must be idempotent.",
  date: "2026-01-15",
  topics: ["data-sync"],
  buildsOn: [],
  variantOf: [],
  text: "Sync wrote duplicate rows. Keyed the upsert on the slug.",
};

const records = [detour, obstacle, challenge];
const newestFirst = [obstacle, detour, challenge].map((record) => record.href);

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  nav.currentSearch = "";
  nav.replace.mockClear();
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

function render() {
  act(() => root.render(<RecordSearch records={records} />));
}

function field<T extends HTMLElement>(label: string): T {
  const element = container.querySelector<T>(`[aria-label="${label}"]`);
  if (!element) throw new Error(`no element labelled ${label}`);
  return element;
}

function changeSelect(select: HTMLSelectElement, value: string) {
  select.value = value;
  act(() => {
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

function optionValueByText(select: HTMLSelectElement, text: string): string {
  const option = Array.from(select.options).find((item) => item.textContent === text);
  if (!option) throw new Error(`no option ${text}`);
  return option.value;
}

function typeInto(input: HTMLInputElement, text: string) {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, text);
  act(() => {
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

function rowLinks(): HTMLAnchorElement[] {
  const hrefs = records.map((record) => record.href);
  return Array.from(container.querySelectorAll<HTMLAnchorElement>("a")).filter((anchor) =>
    hrefs.includes(anchor.getAttribute("href") ?? ""),
  );
}

function listedHrefs(): string[] {
  return rowLinks().map((anchor) => anchor.getAttribute("href") ?? "");
}

describe("RecordSearch", () => {
  it("renders a labelled search input", () => {
    render();
    const input = field<HTMLInputElement>("Search records");
    expect(input.tagName).toBe("INPUT");
  });

  it.each([
    ["Filter by topic", "Any topic", ["data-sync", "graph-ui", "testing"]],
    ["Filter by kind", "Any kind", ["challenge", "detour", "obstacle"]],
    ["Filter by outcome", "Any outcome", ["open", "solved"]],
    ["Filter by project", "Any project", ["distillate", "namaq"]],
  ])("renders %s with an Any option and the distinct values present", (label, anyText, values) => {
    render();
    const select = field<HTMLSelectElement>(label);
    const texts = Array.from(select.options).map((option) => option.textContent);
    expect(texts).toHaveLength(values.length + 1);
    expect(texts).toEqual(expect.arrayContaining([anyText, ...values]));
  });

  it("lists every record newest first, each linking to its href and showing its problem", () => {
    render();
    expect(listedHrefs()).toEqual(newestFirst);
    for (const anchor of rowLinks()) {
      const record = records.find((item) => item.href === anchor.getAttribute("href"));
      expect(anchor.textContent).toContain(record!.problem);
    }
  });

  it("shows a status line counting shown against total records", () => {
    render();
    expect(container.textContent).toContain("3 of 3 records");
  });

  it("shows each row's outcome in text for screen readers", () => {
    render();
    for (const record of records) {
      const anchor = rowLinks().find((item) => item.getAttribute("href") === record.href)!;
      const row = anchor.closest("li") ?? anchor;
      expect(row.textContent).toContain(`Outcome: ${record.outcome}`);
    }
  });

  it.each([
    ["Filter by topic", "testing", "/records?topic=testing"],
    ["Filter by kind", "detour", "/records?kind=detour"],
    ["Filter by outcome", "open", "/records?outcome=open"],
    ["Filter by project", "namaq", "/records?project=namaq"],
  ])("choosing a value in %s calls router.replace with %s", (label, value, expected) => {
    render();
    changeSelect(field<HTMLSelectElement>(label), value);
    expect(nav.replace.mock.lastCall![0]).toBe(expected);
  });

  it("choosing Any removes that key from the URL", () => {
    nav.currentSearch = "kind=detour";
    render();
    const kind = field<HTMLSelectElement>("Filter by kind");
    changeSelect(kind, optionValueByText(kind, "Any kind"));
    expect(nav.replace).toHaveBeenCalled();
    const url = new URL(nav.replace.mock.lastCall![0], "https://example.test");
    expect(url.pathname).toBe("/records");
    expect(url.searchParams.has("kind")).toBe(false);
  });

  it("typing in the search box calls router.replace with the trimmed text as q", () => {
    render();
    typeInto(field<HTMLInputElement>("Search records"), "  jitters  ");
    expect(nav.replace.mock.lastCall![0]).toBe("/records?q=jitters");
  });

  it("typing in the search box narrows the list to matching records", () => {
    render();
    typeInto(field<HTMLInputElement>("Search records"), "  jitters  ");
    expect(listedHrefs()).toEqual([obstacle.href]);
    expect(container.textContent).toContain("1 of 3 records");
  });

  it("honours the initial URL state, listing only matching records", () => {
    nav.currentSearch = "kind=detour";
    render();
    expect(listedHrefs()).toEqual([detour.href]);
    expect(field<HTMLSelectElement>("Filter by kind").value).toBe("detour");
  });

  it("keeps the typed text when a filter changes before the URL catches up", () => {
    render();
    nav.replace.mockImplementationOnce(() => {});
    typeInto(field<HTMLInputElement>("Search records"), "jitters");
    const kind = field<HTMLSelectElement>("Filter by kind");
    changeSelect(kind, optionValueByText(kind, "obstacle"));
    const url = new URL(nav.replace.mock.lastCall![0], "https://example.test");
    expect(url.searchParams.get("q")).toBe("jitters");
    expect(url.searchParams.get("kind")).toBe("obstacle");
  });

  it("clears the search box when the URL loses its query after mount", () => {
    nav.currentSearch = "q=jitters";
    render();
    expect(listedHrefs()).toEqual([obstacle.href]);
    nav.currentSearch = "";
    render();
    expect(field<HTMLInputElement>("Search records").value).toBe("");
    expect(listedHrefs()).toEqual(newestFirst);
  });

  it("keeps the latest typed text when the URL arrives one keystroke behind", () => {
    render();
    nav.replace.mockImplementation(() => {});
    try {
      typeInto(field<HTMLInputElement>("Search records"), "ji");
      typeInto(field<HTMLInputElement>("Search records"), "jit");
      nav.currentSearch = "q=ji";
      render();
      expect(field<HTMLInputElement>("Search records").value).toBe("jit");
    } finally {
      nav.replace.mockImplementation((url: string) => {
        nav.currentSearch = url.split("?")[1] ?? "";
      });
    }
  });
});
