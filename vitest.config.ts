import mdx from "@mdx-js/rollup";
import remarkGfm from "remark-gfm";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [mdx({ remarkPlugins: [remarkGfm] })],
  oxc: { jsx: { runtime: "automatic" } },
  test: {
    exclude: [...configDefaults.exclude, ".claude/**"],
    environment: "jsdom",
  },
  resolve: { alias: { "@": import.meta.dirname } },
});
