import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/chihuahua-line-dashboard/",
  plugins: [react()],
});
