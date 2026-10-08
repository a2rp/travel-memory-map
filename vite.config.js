import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({ base: "/travel-memory-map/", build: { sourcemap: false }, plugins: [react()] });
