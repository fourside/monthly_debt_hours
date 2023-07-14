import { css } from "../styled-system/css";
import "./style.css";

import { Suspense, useState } from "react";
import { getWorkingStats, type WorkingStats } from "./popup-client";
import { Time, averageTime, subtractTime } from "./time";

export function App() {
  const [promiseWrapper] = useState(() => new PromiseWrapper(getWorkingStats()));

  return (
    <main className={container}>
      <Suspense fallback={<div className={loading}>loading...</div>}>
        <Stats wrapper={promiseWrapper} />
      </Suspense>
    </main>
  );
}

const container = css({
  width: "100%",
  padding: "2rem",
});

const loading = css({
  display: "flex",
  placeItems: "center",
});

function Stats({ wrapper }: { wrapper: PromiseWrapper<WorkingStats> }) {
  const stats = wrapper.getData();
  const restTime = subtractTime(stats.fixedTime, stats.actualTime);
  const restDays = Math.trunc(stats.fixedTime.hour / 8) - stats.actualDays;
  const avgTime = averageTime(restTime, restDays);
  const debt = subtractTime({ hour: restDays * 8, minute: 0 }, restTime);

  console.debug({ stats });
  return (
    <div>
      <div>
        rest: {restDays} day (<TimeComponent time={restTime} />)
      </div>
      <div>
        average: <TimeComponent time={avgTime} />
      </div>
      <div>
        debt: <TimeComponent time={debt} />
      </div>
    </div>
  );
}

function TimeComponent({ time }: { time: Time }) {
  return (
    <span>
      {String(time.hour).padStart(2, "0")}:{String(time.minute).padStart(2, "0")}
    </span>
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
