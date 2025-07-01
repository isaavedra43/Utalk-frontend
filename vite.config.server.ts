import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
lib: {
    entry: path.resolve(__dirname, "server/node-build.ts"),
    name: "server",
    fileName: "production",
    formats: ["es"],
  },
    outDir: "dist/server",
    target: "node22",
    rollupOptions: {
      external: [
        // Node.js built-ins
        "fs",
        "path",
        "url",
        "http",
        "https",
        "os",
        "crypto",
        "stream",
        "util",
        "events",
        "buffer",
        "querystring",
        "child_process",
        // External dependencies that should not be bundled
        "express",
        "cors",
      ],
      output: {
        format: "esm",
        entryFileNames: "[name].js", // <-- Cambiado de .mjs a .js para compatibilidad Railway
      },
    },
    minify: false, 
    sourcemap: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  define: {
    "process.env.NODE_ENV": '"production"',
  },
});
