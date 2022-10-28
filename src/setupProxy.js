// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createProxyMiddleware } = require("http-proxy-middleware");

const matWfsUsername = process.env.REACT_APP_MATRIKKELWFS_USERNAME;
const matWfsPassword = process.env.REACT_APP_MATRIKKELWFS_PASSWORD;

const baatUsername = process.env.REACT_APP_BAAT_USERNAME;
const baatPassword = process.env.REACT_APP_BAAT_PASSWORD;

module.exports = function (app) {
  app.use(
    createProxyMiddleware("/api/auth/", {
      // bytt ut med lokalt kjørende aut-idporten evt.
      target: "http://aut-idporten.aut",
      changeOrigin: true,
    })
  );

  app.use(
    createProxyMiddleware("/v1", {
      target: "http://localhost:8080",
      changeOrigin: true,
    })
  );

  app.use(
    createProxyMiddleware("/actuator/info", {
      target: "http://localhost:8080",
      changeOrigin: true,
    })
  );

  app.use(
    createProxyMiddleware("/geoservergeo/wfs/matrikkel", {
      target: "https://prodtest.matrikkel.no",
      changeOrigin: true,
      headers: {
        Authorization:
          "Basic " +
          new Buffer(matWfsUsername + ":" + matWfsPassword).toString("base64"),
      },
    })
  );

  app.use(
    createProxyMiddleware("/skbaatts/req", {
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
    })
  );

  // låste bakgrunnskart må proxyes gjennom backend pga cors
  app.use(
    createProxyMiddleware(["/skwms1/wms.nib", "/skwms1/wms.ecc_enc"], {
      target: "https://wms.geonorge.no",
      changeOrigin: true,
    })
  );
};
