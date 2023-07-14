import { App } from "./app";
import type { WorkingStats } from "./popup-client";

const stats: WorkingStats = {
  actualDays: 3,
  actualTime: { hour: 12, minute: 35 },
  fixedTime: { hour: 64, minute: 18 },
};

export default {
  success: <App getWorkingStats={() => new Promise((resolve) => resolve(stats))} />,
  loading: <App getWorkingStats={() => new Promise(() => {})} />,
  error: <App getWorkingStats={() => new Promise((_, reject) => reject(new Error("something wrong.")))} />,
};
