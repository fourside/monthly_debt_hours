export type Time = {
  hour: number;
  minute: number;
};

export function parseTime(timeStr: string): Time {
  const [hourStr, minuteStr] = timeStr.split(":");
  return normalizeTime({
    hour: Number(hourStr),
    minute: Number(minuteStr),
  });
}

export function addTime(from: Time, to: Time): Time {
  return normalizeTime({
    hour: from.hour + to.hour,
    minute: from.minute + to.minute,
  });
}

export function subtractTime(from: Time, to: Time): Time {
  return normalizeTime({
    hour: from.hour - to.hour,
    minute: from.minute - to.minute,
  });
}

export function averageTime(restTime: Time, restDays: number): Time {
  const totalMin = restTime.hour * 60 + restTime.minute;
  const averageMin = Math.trunc(totalMin / restDays);

  return normalizeTime({
    hour: Math.trunc(averageMin / 60),
    minute: Math.trunc(averageMin % 60),
  });
}

export function greaterThanOrEqual(a: Time, b: Time): boolean {
  const aMin = a.hour * 60 + a.minute;
  const bMin = b.hour * 60 + b.minute;
  return aMin >= bMin;
}

function normalizeTime(time: Time): Time {
  const normalized: Time = {
    hour: time.hour + Math.trunc(time.minute / 60),
    minute: time.minute % 60,
  };
  if (normalized.minute >= 0) {
    return normalized;
  }
  return {
    hour: normalized.hour - 1,
    minute: normalized.minute + 60,
  };
}
