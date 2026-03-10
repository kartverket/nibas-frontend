import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";
import { checker } from "vite-plugin-checker";

export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  // Husk å restarte etter endringer i f.eks env.local
  const matWfsAuth = process.env.VITE_MATRIKKELWFS_AUTH;
  const matWfsUrl = process.env.VITE_MATRIKKELWFS_URL;
  const baatUsername = process.env.VITE_BAAT_USERNAME;
  const baatPassword = process.env.VITE_BAAT_PASSWORD;
  const repo_pr_access = process.env.VITE_REPO_PR_ACCESS; // finnes på gcp under samme navn

  return {
    build: {
      outDir: "build",
      sourcemap: true,
    },
    plugins: [
      react({
        babel: {
          plugins: [["babel-plugin-react-compiler", { target: "18" }]],
        },
      }),
      viteTsconfigPaths(),
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
        "/repos/kartverket/": {
          target: "https://api.github.com",
          changeOrigin: true,
          headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${repo_pr_access}`,
            "X-GitHub-Api-Version": "2022-11-28",
            Host: "api.github.com",
          },
        },
        "/v1": {
          target: "http://localhost:8080",
          changeOrigin: true,
          headers: {
            "X-Auth-Name": "Utvikler",
          },
        },
        "/internal-api/api/v1": {
          target: "http://localhost:8082",
          changeOrigin: true,
          headers: {
            "X-Auth-Name": "Utvikler",
          },
        },
        "/geoservergeo/wfs/matrikkel": {
          target: matWfsUrl,
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

            if (path.indexOf("tjenesteid=wms.ecc_enc") !== -1) {
              tjenesteId = "wms.ecc_enc";
            } else if (path.indexOf("tjenesteid=wms.nib") !== -1) {
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
