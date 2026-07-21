import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

function stripCrossorigin(): Plugin {
  return {
    name: "strip-crossorigin",
    enforce: "post",
    generateBundle(_options, bundle) {
      for (const fileName of Object.keys(bundle)) {
        if (fileName === "index.html") {
          const chunk = bundle[fileName] as { source: string };
          chunk.source = chunk.source
            .replace(/ crossorigin/g, "")
            .replace(/<title>.*?<\/title>/, "<title>Malir Tonight</title>");
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), stripCrossorigin()],
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
