import { number, object } from "joi";
import { WorkingStats } from "./popup-client";
import { Time } from "./time";

const timeSchema = object<Time>({
  hour: number(),
  minute: number(),
});

export const workingStatsSchema = object<WorkingStats>({
  actualDays: number(),
  actualTime: timeSchema,
  fixedTime: timeSchema,
});
