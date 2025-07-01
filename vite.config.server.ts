import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    ssr: path.resolve(__dirname, "server/node-build.ts"),
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
