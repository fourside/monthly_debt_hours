import "./style.css";

import { Suspense, useState } from "react";
import { getWorkingStats, type WorkingStats } from "./popup-client";
import { averageTime, subtractTime } from "./time";

export function App() {
  const [promiseWrapper] = useState(
    () => new PromiseWrapper(getWorkingStats())
  );

  return (
    <Suspense fallback={<div>loading...</div>}>
      <Stats wrapper={promiseWrapper} />
    </Suspense>
  );
}

function Stats({ wrapper }: { wrapper: PromiseWrapper<WorkingStats> }) {
  const stats = wrapper.getData();
  const restTime = subtractTime(stats.fixedTime, stats.actualTime);
  const restDays = Math.trunc(stats.fixedTime.hour / 8) - stats.actualDays;
  const avgTime = averageTime(restTime, restDays);

  console.debug({ stats });
  return (
    <div>
      <div>
        rest: {restDays} day ({restTime.hour}:{restTime.minute})
      </div>
      <div>
        average: {avgTime.hour}:{avgTime.minute}
      </div>
    </div>
  );
}

class PromiseWrapper<T> {
  private state:
    | { type: "pending"; promise: Promise<T> }
    | { type: "fulfilled"; data: T }
    | { type: "failed"; error: unknown };

  constructor(promise: Promise<T>) {
    this.state = { type: "pending", promise };
    promise.then(
      (data) => {
        this.state = { type: "fulfilled", data };
      },
      (error: unknown) => {
        this.state = { type: "failed", error };
      }
    );
  }
  getData(): T {
    if (this.state.type === "fulfilled") {
      return this.state.data;
    }
    if (this.state.type === "pending") {
      throw this.state.promise;
    }
    if (this.state.type === "failed") {
      throw this.state.error;
    }
    throw new Error("this.state.type", this.state);
  }
}
