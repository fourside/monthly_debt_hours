import Ajv, { JSONSchemaType } from "ajv";
import type { Time } from "./time";

export type WorkingStats = {
  actualDays: number; // 実働日数
  fixedTime: Time; // 所定労働時間
  actualTime: Time; // 実働時間
};

export function getWorkingStats(): Promise<WorkingStats> {
  return asyncRetry(_getWorkingStats);
}

const ajv = new Ajv();

function _getWorkingStats(): Promise<WorkingStats> {
  return new Promise<WorkingStats>((resolve, reject) =>
    chrome.tabs.query({ currentWindow: true, active: true }, async (tabs) => {
      const tab = tabs[0];
      try {
        const response = await chrome.tabs.sendMessage(tab.id!, {
          type: "mount",
        });
        if (!ajv.validate(workingStatsSchema, response)) {
          throw new Error("validation error");
        }
        resolve(response);
      } catch (error) {
        reject(error);
      }
    })
  );
}

const timeSchema: JSONSchemaType<Time> = {
  type: "object",
  properties: {
    hour: { type: "integer" },
    minute: { type: "integer" },
  },
  required: ["hour", "minute"],
  additionalProperties: false,
};

const workingStatsSchema: JSONSchemaType<WorkingStats> = {
  type: "object",
  properties: {
    actualDays: { type: "integer" },
    actualTime: timeSchema,
    fixedTime: timeSchema,
  },
  required: ["actualDays", "actualTime", "fixedTime"],
  additionalProperties: false,
};

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
