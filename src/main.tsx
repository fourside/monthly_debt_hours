import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app";
import type { WorkingStats } from "./content";

ReactDOM.createRoot(document.getElementById("app")!).render(
  <React.StrictMode>
    <App getWorkingStats={() => asyncRetry(getWorkingStats)} />
  </React.StrictMode>
);

function getWorkingStats(): Promise<WorkingStats> {
  return new Promise<WorkingStats>((resolve, reject) =>
    chrome.tabs.query({ currentWindow: true, active: true }, async (tabs) => {
      const tab = tabs[0];
      try {
        const response = await chrome.tabs.sendMessage(tab.id!, {
          type: "mount",
        });
        resolve(response);
      } catch (error) {
        reject(error);
      }
    })
  );
}

async function asyncRetry<T>(
  callback: () => Promise<T>,
  attempt = 0
): Promise<T> {
  try {
    return await callback();
  } catch (error) {
    if (error instanceof Error) {
      if (attempt >= 10) {
        console.error("retry over 10 times.");
        throw error;
      }
      await delay();
      return await asyncRetry(callback, attempt++);
    }
    throw error;
  }
}

async function delay(ms: number = 1000): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
