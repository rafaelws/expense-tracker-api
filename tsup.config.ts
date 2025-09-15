import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "dist",
  format: ["esm"],
  target: "node24",
  splitting: false,
  clean: true,
  minify: true,
  dts: false,
});