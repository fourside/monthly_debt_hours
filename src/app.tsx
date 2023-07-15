import { css, cx } from "../styled-system/css";
import "../styled-system/global.css";
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
        <Suspense fallback={<Loading />}>
          <Stats wrapper={promiseWrapper} />
        </Suspense>
      </ErrorBoundary>
    </main>
  );
}

const container = css({
  width: "100%",
  padding: "1rem",
  minHeight: "120px",
  minWidth: "320px",
  containerType: "size",
});

function Loading() {
  return (
    <div className={loading}>
      <div>
        {"loading...".split("").map((char, i) => (
          <span key={i} className={cx(loadingChar, css({ animationDelay: `${(i + 1) / 10}s` }))}>
            {char}
          </span>
        ))}
      </div>
    </div>
  );
}

const loading = css({
  display: "grid",
  placeItems: "center",
  height: "100cqh",
  fontFamily: "monospace",
  fontSize: "xl",
  color: "gray",
});

const loadingChar = css({
  animationName: "loading-char",
  animationIterationCount: "infinite",
  animationDuration: "2s",
});

function Stats({ wrapper }: { wrapper: PromiseWrapper<WorkingStats> }) {
  const stats = wrapper.getData();
  const restTime = subtractTime(stats.fixedTime, stats.actualTime);
  const restDays = Math.trunc(stats.fixedTime.hour / 8) - stats.actualDays;
  const avgTime = averageTime(restTime, restDays);
  const debt = subtractTime({ hour: restDays * 8, minute: 0 }, restTime);

  console.debug({ stats });
  return (
    <div className={statsContainer}>
      <div className={statsMain}>
        <div className={statsRow}>
          <span className={statsLabel}>debt:</span>
          <span className={statsValue}>{formatTime(debt)}</span>
        </div>
      </div>
      <div className={statsSub}>
        <div className={statsRow}>
          <span className={statsLabel}>average:</span>
          <span className={statsValue}>{formatTime(avgTime)}</span>
        </div>
        <div className={statsRow}>
          <span className={statsLabel}>rest:</span>
          <span className={statsValue}>
            {formatTime(restTime)} ... {restDays} day
          </span>
        </div>
      </div>
    </div>
  );
}

const statsContainer = css({
  display: "flex",
  flexDirection: "column",
  gap: "8px",
});

const statsMain = css({
  fontSize: "2xl",
});

const statsSub = css({
  color: "gray",
  fontSize: "sm",
});

const statsRow = css({
  display: "grid",
  grid: "auto / 80px 1fr",
});

const statsLabel = css({
  fontWeight: "bold",
});

const statsValue = css({});

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
          <h1 className={errorHeading}>Error</h1>
          <div className={errorMessage}>{this.state.error.message}</div>
        </div>
      );
    }

    return this.props.children;
  }
}

const errorHeading = css({
  fontSize: "2xl",
});

const errorMessage = css({
  color: "red.500",
});

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
