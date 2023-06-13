import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./components/App";
import "./i18n";

// TODO: kvitte oss med denne i react 18? skjer noe med dependency da?
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
