import { css } from "../styled-system/css";
import "./style.css";

import { Component, ErrorInfo, ReactNode, Suspense, useState } from "react";
import { type WorkingStats } from "./popup-client";
import { Time, averageTime, subtractTime } from "./time";

type Props = {
  getWorkingStats: () => Promise<WorkingStats>;
};

export function App({ getWorkingStats }: Props) {
  const [promiseWrapper] = useState(() => new PromiseWrapper(getWorkingStats()));

  return (
    <main className={container}>
      <ErrorBoundary>
        <Suspense fallback={<div className={loading}>loading...</div>}>
          <Stats wrapper={promiseWrapper} />
        </Suspense>
      </ErrorBoundary>
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
      <div>debt: {formatTime(debt)}</div>
      <div>average: {formatTime(avgTime)}</div>
      <div>
        rest: {formatTime(restTime)} ... {restDays} day
      </div>
    </div>
  );
}

function formatTime(time: Time): string {
  return `${String(time.hour).padStart(2, "0")}:${String(time.minute).padStart(2, "0")}`;
}

type ErrorBoundaryProps = {
  children?: ReactNode;
};

type ErrorBoundaryState =
  | {
      hasError: false;
    }
  | {
      hasError: true;
      error: Error;
    };

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error);
    console.error(info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h1>Error</h1>
          <div>{this.state.error.message}</div>
        </div>
      );
    }

    return this.props.children;
  }
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
