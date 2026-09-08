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
