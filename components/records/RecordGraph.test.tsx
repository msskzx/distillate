import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { IndexedRecord } from "@/lib/search";
import { RecordGraph } from "./RecordGraph";

vi.mock("next/link", async () => {
  const React = await import("react");
  return {
    default: ({ href, children, ...rest }: { href: string; children?: React.ReactNode }) =>
      React.createElement("a", { ...rest, href }, children),
  };
});

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function record(id: string, overrides: Partial<IndexedRecord> = {}): IndexedRecord {
  return {
    id,
    project: id.split("/")[0],
    slug: id.split("/")[1],
    href: `/records/${id}`,
    url: `https://example.test/records/${id}`,
    title: `Record ${id}`,
    summary: `Summary ${id}`,
    disclosure: "open",
    sourceProject: id.split("/")[0],
    kind: "detour",
    problem: `Problem ${id}`,
    approach: `Approach ${id}`,
    outcome: "solved",
    conditions: `Conditions ${id}`,
    evidence: `Evidence ${id}`,
    implication: `Implication ${id}`,
    date: "2026-10-01",
    topics: ["testing"],
    buildsOn: [],
    variantOf: [],
    text: `Searchable ${id}`,
    ...overrides,
  };
}

const ancestor = record("alpha/ancestor");
const variant = record("alpha/variant", { variantOf: [ancestor.id] });
const child = record("alpha/child", { buildsOn: [ancestor.id, variant.id] });
const isolated = record("beta/isolated");
const records = [ancestor, variant, child, isolated];
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

function render(items = records, matches = items) {
  act(() => root.render(<RecordGraph records={items} matches={matches} />));
}

function node(item: IndexedRecord): HTMLButtonElement {
  const button = Array.from(container.querySelectorAll("button")).find((element) =>
    `${element.getAttribute("aria-label") ?? ""} ${element.textContent}`.includes(item.title),
  );
  if (!button) throw new Error(`No selectable node for ${item.title}`);
  return button;
}

function select(item: IndexedRecord) {
  act(() => node(item).click());
}

describe("RecordGraph", () => {
  it("renders every record as a focusable native button including isolated records", () => {
    render();
    for (const item of records) {
      const button = node(item);
      expect(button.disabled).toBe(false);
      expect(button.tabIndex).toBeGreaterThanOrEqual(0);
      button.focus();
      expect(document.activeElement).toBe(button);
    }
  });

  it("shows the selected record's details and full record link", () => {
    render();
    select(isolated);
    for (const value of [isolated.problem, isolated.approach, isolated.outcome, isolated.conditions, isolated.evidence]) {
      expect(container.textContent).toContain(value);
    }
    expect(container.querySelector(`a[href="${isolated.href}"]`)).not.toBeNull();
    select(child);
    for (const value of [child.problem, child.approach, child.conditions, child.evidence]) {
      expect(container.textContent).toContain(value);
    }
    expect(container.querySelector(`a[href="${child.href}"]`)).not.toBeNull();
  });

  it("shows links to both explicit parent records when their child is selected", () => {
    render();
    select(child);
    expect(container.querySelector(`a[href="${ancestor.href}"]`)).not.toBeNull();
    expect(container.querySelector(`a[href="${variant.href}"]`)).not.toBeNull();
    select(variant);
    expect(container.querySelector(`a[href="${ancestor.href}"]`)).not.toBeNull();
  });

  it("retains node positions and selectable context when matches change", () => {
    render();
    const positions = records.map((item) => node(item).getAttribute("style"));
    expect(positions.every((style) => style?.includes("left:") && style.includes("top:"))).toBe(true);
    render(records, [child]);
    expect(records.map((item) => node(item).getAttribute("style"))).toEqual(positions);
    expect(node(child).getAttribute("class")).not.toBe(node(isolated).getAttribute("class"));
    select(isolated);
    expect(container.textContent).toContain(isolated.evidence);
  });

  it("keeps all nodes visible when there are zero matches", () => {
    render(records, []);
    for (const item of records) expect(node(item)).toBeDefined();
    expect(container.textContent).toMatch(/no (?:matching )?(?:records|matches|results)|0 (?:of|matching|results)/i);
  });

  it("draws only explicit relationships with a directed builds-on style and dashed variants", () => {
    render();
    const edges = Array.from(container.querySelectorAll<SVGPathElement>("path[data-relationship]"));
    expect(edges).toHaveLength(3);
    const buildsOn = edges.filter((edge) => edge.dataset.relationship === "buildsOn");
    const variants = edges.filter((edge) => edge.dataset.relationship === "variantOf");
    expect(buildsOn).toHaveLength(2);
    expect(variants).toHaveLength(1);
    expect(buildsOn.map((edge) => edge.getAttribute("aria-label"))).toEqual(expect.arrayContaining([
      `${child.title} builds on ${ancestor.title}`,
      `${child.title} builds on ${variant.title}`,
    ]));
    expect(variants[0].getAttribute("aria-label")).toBe(`${variant.title} variant of ${ancestor.title}`);
    for (const edge of buildsOn) {
      expect(edge.getAttribute("marker-end")).toMatch(/^url\(#.+\)$/);
      expect(edge.getAttribute("stroke-dasharray")).toBeNull();
    }
    expect(variants[0].getAttribute("marker-end")).toBeNull();
    expect(variants[0].getAttribute("stroke-dasharray")).toMatch(/\d/);
    expect(container.textContent).toMatch(/builds on/i);
    expect(container.textContent).toMatch(/variant of/i);
  });

  it("renders all records in a cycle and preserves multiple parents", () => {
    const cycleA = record("cycle/a", { buildsOn: ["cycle/b", "cycle/c"] });
    const cycleB = record("cycle/b", { buildsOn: ["cycle/a"] });
    const cycleC = record("cycle/c");
    render([cycleA, cycleB, cycleC]);
    for (const item of [cycleA, cycleB, cycleC]) expect(node(item)).toBeDefined();
    select(cycleA);
    expect(container.querySelector(`a[href="${cycleB.href}"]`)).not.toBeNull();
    expect(container.querySelector(`a[href="${cycleC.href}"]`)).not.toBeNull();
  });

  it("shows an explicit empty state when the index is empty", () => {
    render([]);
    expect(container.textContent).toMatch(/no records|no .*records|empty/i);
    expect(container.querySelectorAll("button")).toHaveLength(0);
  });
});
