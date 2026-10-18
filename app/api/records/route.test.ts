import { describe, expect, it } from "vitest";
import index from "@/records.json";
import { searchRecords } from "@/lib/search";
import { GET } from "./route";
import type { IndexedRecord } from "@/lib/search";

const indexed = index.records as IndexedRecord[];

const request = (query: string) => new Request(`https://x/api/records${query}`);

describe("GET /api/records", () => {
  it("responds 200 with a wildcard CORS origin header", async () => {
    const response = await GET(request("?q=highlight&kind=detour"));
    expect(response.status).toBe(200);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });

  it("returns the same ids in the same order as searchRecords for the query", async () => {
    const expected = searchRecords(indexed, { q: "highlight", kind: "detour" });
    expect(expected.length).toBeGreaterThan(0);

    const response = await GET(request("?q=highlight&kind=detour"));
    const body = (await response.json()) as { records: { id: string }[] };
    expect(body.records.map((item) => item.id)).toEqual(expected.map((item) => item.id));
  });

  it("returns every record in records.json when there is no query string", async () => {
    const response = await GET(request(""));
    const body = (await response.json()) as { records: { id: string }[] };
    expect(body.records).toHaveLength(indexed.length);
    expect(body.records.map((item) => item.id)).toEqual(
      searchRecords(indexed, {}).map((item) => item.id),
    );
  });

  it("returns an empty records list with status 200 for an unknown filter value", async () => {
    const response = await GET(request("?kind=nope"));
    expect(response.status).toBe(200);
    expect(await response.json()).toStrictEqual({ records: [] });
  });

  it("returns an object with a records array for a query that matches nothing", async () => {
    const response = await GET(request("?q=zzzqqqnomatch"));
    expect(response.status).toBe(200);
    expect(await response.json()).toStrictEqual({ records: [] });
  });
});
