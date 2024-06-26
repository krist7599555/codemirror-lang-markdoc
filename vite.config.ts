import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { externalizeDeps } from "vite-plugin-externalize-deps";

export default defineConfig({
  plugins: [
    externalizeDeps(),
    dts({
      outDir: "./dist",
      include: ["./src/**.ts"],
    }),
  ],
  build: {
    minify: false,
    lib: {
      formats: ["es"],
      entry: [
        "./src/index.ts",
        "./src/v5.ts",
        "./src/codemirror-lang-markdoc.ts",
        "./src/markdoc-linter-extension.ts",
        "./src/liquid-completion-patch.ts",
      ],
      fileName: (fmt, entry_name) => `${entry_name}.mjs`,
    },
  },
  ssr: {
    external: ["@codemirror/*"],
  },
});
