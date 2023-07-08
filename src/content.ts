function main(): void {
  const actual = actualWorkingTime();
  const fixed = fixedWorkingTime();
  chrome.runtime.sendMessage({ actual, fixed });
}

type Time = {
  hour: number;
  minute: number;
};

function actualWorkingTime(): Time {
  const workingTimeTable = getWorkingTimeTable();
  const textContent = queryTextContent(
    workingTimeTable,
    "tr:nth-child(1) td",
    "実労働時間"
  );
  const [hourStr, minuteStr] = textContent.split(":");
  return normalizeTime({
    hour: Number(hourStr),
    minute: Number(minuteStr),
  });
}

function fixedWorkingTime(): Time {
  const workingTimeTable = getWorkingTimeTable();
  const textContent = queryTextContent(
    workingTimeTable,
    "tr:nth-child(2) td",
    "月規定労働時間"
  );
  const [hourStr, minuteStr] = textContent.split(":");
  return {
    hour: Number(hourStr),
    minute: Number(minuteStr),
  };
}

function getWorkingTimeTable(): HTMLTableElement {
  return document.querySelectorAll("table")[3];
}

function queryTextContent(
  element: HTMLElement,
  selector: string,
  label: string
): string {
  const result = element.querySelector(selector)?.textContent;
  if (result === null || result === undefined) {
    throw new Error(`${label} not be there`);
  }
  return result;
}

function normalizeTime(time: Time): Time {
  return {
    hour: time.hour + Math.trunc(time.minute / 60),
    minute: time.minute % 60,
  };
}

main();
