import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";
import eslint from "vite-plugin-eslint";
import { checker } from "vite-plugin-checker";

export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  const matWfsAuth = process.env.VITE_MATRIKKELWFS_AUTH;

  const baatUsername = process.env.VITE_BAAT_USERNAME;
  const baatPassword = process.env.VITE_BAAT_PASSWORD;

  return {
    build: {
      outDir: "build",
      sourcemap: true,
    },
    plugins: [
      react(),
      viteTsconfigPaths(),
      eslint(),
      checker({
        typescript: true,
      }),
    ],
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/test/test-setup.ts",
    },
    server: {
      port: 3000,
      open: true,
      proxy: {
        "/api/auth/": {
          // bytt ut med lokalt kjørende aut-idporten evt.
          target: "https://aut-idporten.dev.skip.statkart.no",
          changeOrigin: true,
        },
        "/v1": {
          target: "http://localhost:8080",
          changeOrigin: true,
        },
        "/geoservergeo/wfs/matrikkel": {
          target: "https://prodtest.matrikkel.no",
          changeOrigin: true,
          headers: {
            Authorization: `Basic ${matWfsAuth}`,
          },
        },
        "/skbaatts/req": {
          target: "https://baat.geonorge.no",
          changeOrigin: true,
          pathRewrite: (path) => {
            let tjenesteId = "";

            if (path.includes("tjenesteid=wms.ecc_enc")) {
              tjenesteId = "wms.ecc_enc";
            } else if (path.includes("tjenesteid=wms.nib")) {
              tjenesteId = "wms.nib";
            }

            return `/skbaatts/req?tjenesteid=${tjenesteId}&brukerid=${baatUsername}&passord=${baatPassword}&retformat=s`;
          },
        },
        "/skwms1/wms.matrikkel.v1": {
          target: "https://wms.geonorge.no",
          changeOrigin: true,
        },
        "/skwms1/wms.nib": {
          target: "https://wms.geonorge.no",
          changeOrigin: true,
        },
        "/skwms1/wms.ecc_enc": {
          target: "https://wms.geonorge.no",
          changeOrigin: true,
        },
      },
    },
  };
});
