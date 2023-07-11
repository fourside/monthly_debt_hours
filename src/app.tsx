import "./style.css";

import { useEffect, useState } from "preact/hooks";
import { WorkingStats } from "./content";
import { subtractTime } from "./time";

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
      {loading ? (
        <div>loading</div>
      ) : stats === undefined ? (
        <div>not found</div>
      ) : (
        <Stats stats={stats} />
      )}
    </div>
  );
}

function Stats({ stats }: { stats: WorkingStats }) {
  const restTime = subtractTime(stats.fixedTime, stats.actualTime);
  const restDays = Math.floor(stats.fixedTime.hour / 8) - stats.actualDays;
  const restMin = restTime.hour * 60 + restTime.minute;
  const averageHour = Math.floor(restMin / restDays / 60);
  const averageMin = Math.floor(restMin / restDays) % 60;
  console.debug({ stats });
  return (
    <div>
      <div>
        rest: {restDays} day ({restTime.hour}:{restTime.minute})
      </div>
      <div>
        average: {averageHour}:{averageMin}
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
