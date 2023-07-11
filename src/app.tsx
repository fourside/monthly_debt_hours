import "./style.css";

import { useEffect, useState } from "preact/hooks";
import { WorkingStats } from "./content";

type Props = {
  getWorkingStats: () => Promise<WorkingStats>;
};

export function App({ getWorkingStats }: Props) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<WorkingStats>();

  useEffect(() => {
    (async () => {
      try {
        const stats = await asyncRetry(getWorkingStats);
        setStats(stats);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <h1>Monthly debt hours</h1>
      <div>
        {loading ? (
          <div>loading</div>
        ) : stats === undefined ? (
          <div>not found</div>
        ) : (
          <>
            <div>
              actual time: {stats.actualTime.hour}:{stats.actualTime.minute}
            </div>
            <div>actual days: {stats.actualDays}</div>
            <div>
              fixed: {stats.fixedTime.hour}:{stats.fixedTime.minute}
            </div>
          </>
        )}
      </div>
    </div>
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
