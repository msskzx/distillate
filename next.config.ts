import createMDX from "@next/mdx";
import type { NextConfig } from "next";
import remarkGfm from "remark-gfm";

// Record ids gained an R on 2026-11-16 (0019 became R0019). Four namaq numbers
// had been given twice; the second record of each pair took a new number.
const renumbered: [string, string][] = [
  ["0029-a-pair-must-be-named-in-the-quoted-sentence", "R0044-a-pair-must-be-named-in-the-quoted-sentence"],
  ["0031-a-scaled-page-is-a-picture-not-bigger-text", "R0045-a-scaled-page-is-a-picture-not-bigger-text"],
  ["0032-a-hidden-box-still-holds-its-place", "R0046-a-hidden-box-still-holds-its-place"],
  ["0038-a-tab-page-cannot-swipe-back", "R0047-a-tab-page-cannot-swipe-back"],
];

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
  async redirects() {
    return [
      ...renumbered.map(([from, to]) => ({ source: `/records/namaq/${from}`, destination: `/records/namaq/${to}`, permanent: true })),
      { source: "/records/:project/:slug(\\d{4}-[a-z0-9-]+)", destination: "/records/:project/R:slug", permanent: true },
    ];
  },
};

export default createMDX({ options: { remarkPlugins: [remarkGfm] } })(nextConfig);
