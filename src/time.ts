export type Time = {
  hour: number;
  minute: number;
};

export function parseTime(timeStr: string): Time {
  const [hourStr, minuteStr] = timeStr.split(":");
  return {
    hour: Number(hourStr),
    minute: Number(minuteStr),
  };
}

export function addTime(from: Time, to: Time): Time {
  const fromMin = from.minute + from.hour * 60;
  const toMin = to.minute + to.hour * 60;
  const sumMin = fromMin + toMin;
  return {
    hour: Math.floor(sumMin / 60),
    minute: sumMin % 60,
  };
}

export function subtractTime(from: Time, to: Time): Time {
  const fromMin = from.minute + from.hour * 60;
  const toMin = to.minute + to.hour * 60;
  const diffMin = fromMin - toMin;
  return {
    hour: Math.floor(diffMin / 60),
    minute: diffMin % 60,
  };
}

export function normalizeTime(time: Time): Time {
  return {
    hour: time.hour + Math.trunc(time.minute / 60),
    minute: time.minute % 60,
  };
}
