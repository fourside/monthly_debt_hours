import "./style.css";

import { useEffect, useState } from "preact/hooks";
import { WorkingStats } from "./content";

type Props = {
  getWorkingStats: () => Promise<WorkingStats>;
};

export function App({ getWorkingStats }: Props) {
  // TODO: 残り労働時間の算出... (fixedTime - actualTime)
  // TODO: restDays = fixedDays - actualDays
  // TODO: 平均何時間早上がり？... restTime - (restDays * 8h)
  // MEMO: ▲はマイナス
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
              actual: {stats.actualTime.hour}:{stats.actualTime.minute}
            </div>
            <div>
              fixed: {stats.fixedTime.hour}:{stats.fixedTime.minute}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

async function asyncRetry<T>(callback: () => Promise<T>): Promise<T> {
  try {
    return await callback();
  } catch (error) {
    if (error instanceof Error) {
      await delay();
      return await asyncRetry(callback);
    }
    throw error;
  }
}

async function delay(ms: number = 1000): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
