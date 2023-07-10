import { render } from "preact";
import { App } from "./app";
import type { WorkingStats } from "./content";

render(
  <App getWorkingStats={getWorkingStats} />,
  document.getElementById("app") as HTMLElement
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
