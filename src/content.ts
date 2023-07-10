function main(): void {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "mount") {
      const actualTime = actualWorkingTime();
      const fixedTime = fixedWorkingTime();
      sendResponse({ actualTime, fixedTime });
    }
    // TODO: 所定労働日数
    // TODO: 実働日数
    // TODO: 打刻ミスのレコード取得
    // TODO: 打刻ミスを上記結果に当て込み
    return true;
  });
}

type Time = {
  hour: number;
  minute: number;
};

export type WorkingStats = {
  fixedDays: number; // 所定労働日数
  actualDays: number; // 実働日数
  fixedTime: Time; // 所定労働時間
  actualTime: Time; // 実働時間
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
