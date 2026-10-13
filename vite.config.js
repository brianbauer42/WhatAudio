import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const API_TARGET = process.env.API_TARGET ?? "http://localhost:8080";

export default defineConfig(({ command }) => ({
  // Express serves the built app under /static. The dev server serves from the
  // root so history fallback and deep links work without a prefix.
  base: command === "build" ? "/static/" : "/",
  plugins: [react()],
  build: {
    outDir: "static",
    emptyOutDir: true,
    sourcemap: true,
    // The Three.js chunk is big by nature; the warning is noise.
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        // Three.js and the fiber stack dwarf the app code; keep them in a
        // chunk of their own so app changes don't invalidate that download.
        codeSplitting: {
          groups: [{ name: "three", test: /node_modules[\\/](three|@react-three|postprocessing)[\\/]/ }],
        },
      },
    },
  },
  server: {
    port: 3000,
    // The API and uploaded media still come from the Express server.
    proxy: {
      "/api": API_TARGET,
      "/resources": API_TARGET,
    },
  },
}));
