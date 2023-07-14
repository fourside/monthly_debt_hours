import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app";
import { getWorkingStats } from "./popup-client";

ReactDOM.createRoot(document.getElementById("app")!).render(
  <React.StrictMode>
    <App getWorkingStats={getWorkingStats} />
  </React.StrictMode>
);
