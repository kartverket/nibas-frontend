import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./components/App";
import "./i18n";

// TODO: kvitte oss med denne i react 18? skjer noe med dependency da?
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
