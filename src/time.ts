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

function normalizeTime(time: Time): Time {
  return {
    hour: time.hour + Math.trunc(time.minute / 60),
    minute: time.minute % 60,
  };
}
