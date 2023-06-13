import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";
import eslint from "vite-plugin-eslint";

export default defineConfig(() => ({
  build: {
    outDir: "build",
  },
  plugins: [react(), viteTsconfigPaths(), eslint()],
  server: {
    port: 3000,
    open: true,
  },
}));
