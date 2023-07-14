import joi from "joi";
import type { Time } from "./time";

export type WorkingStats = {
  actualDays: number; // 実働日数
  fixedTime: Time; // 所定労働時間
  actualTime: Time; // 実働時間
};

export function getWorkingStats(): Promise<WorkingStats> {
  return asyncRetry(_getWorkingStats);
}

type PopupMessage = { type: "mount" };

function _getWorkingStats(): Promise<WorkingStats> {
  return new Promise<WorkingStats>((resolve, reject) =>
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    chrome.tabs.query({ currentWindow: true, active: true }, async (tabs) => {
      const tab = tabs[0];
      try {
        if (tab.id === undefined) {
          throw new Error("tab.id is undefined");
        }
        const response = await chrome.tabs.sendMessage<PopupMessage, WorkingStats>(tab.id, {
          type: "mount",
        });
        const result = workingStatsSchema.validate(response);
        if (result.error !== undefined) {
          throw result.error;
        }
        if (result.warning !== undefined) {
          console.warn(result.warning);
        }
        resolve(result.value);
      } catch (error) {
        console.error(error);
        reject(error);
      }
    })
  );
}

const timeSchema = joi.object<Time>({
  hour: joi.number(),
  minute: joi.number(),
});

const workingStatsSchema = joi.object<WorkingStats>({
  actualDays: joi.number(),
  actualTime: timeSchema,
  fixedTime: timeSchema,
});

async function asyncRetry<T>(callback: () => Promise<T>, attempt = 0): Promise<T> {
  try {
    return await callback();
  } catch (error) {
    if (error instanceof Error) {
      if (attempt >= 5) {
        console.error("retry over 10 times.");
        throw error;
      }
      await delay();
      return await asyncRetry(callback, ++attempt);
    }
    throw error;
  }
}

async function delay(ms: number = 1000): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
