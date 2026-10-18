import mdx from "@mdx-js/rollup";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [mdx()],
  oxc: { jsx: { runtime: "automatic" } },
  test: {
    exclude: [...configDefaults.exclude, ".claude/**"],
    environment: "jsdom",
  },
  resolve: { alias: { "@": import.meta.dirname } },
});
