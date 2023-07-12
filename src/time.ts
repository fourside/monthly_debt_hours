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

function normalizeTime(time: Time): Time {
  return {
    hour: time.hour + Math.trunc(time.minute / 60),
    minute: time.minute % 60,
  };
}
