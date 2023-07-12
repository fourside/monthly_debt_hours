import type { WorkingStats } from "./popup-client";
import { addTime, parseTime, subtractTime, type Time } from "./time";

function main(): void {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "mount") {
      const actualTime = actualWorkingTime();
      const fixedTime = fixedWorkingTime();
      const actualDays = actualWorkingDays();
      const missPunched = getMissPunchedTimes();
      const sumMissPunchedTime = missPunched.reduce<Time>(
        (acc, cur) => addTime(acc, cur),
        { hour: 0, minute: 0 }
      );
      const response: WorkingStats = {
        actualTime: addTime(actualTime, sumMissPunchedTime),
        fixedTime,
        actualDays: actualDays + missPunched.length,
      };
      sendResponse(response);
    }
    return true;
  });
}

function actualWorkingTime(): Time {
  const workingTimeTable = getWorkingTimeTable();
  const textContent = queryTextContent(
    workingTimeTable,
    "tr:nth-child(1) td",
    "実労働時間"
  );
  return parseTime(textContent);
}

function fixedWorkingTime(): Time {
  const workingTimeTable = getWorkingTimeTable();
  const textContent = queryTextContent(
    workingTimeTable,
    "tr:nth-child(2) td",
    "月規定労働時間"
  );
  return parseTime(textContent);
}

function actualWorkingDays(): number {
  const basisTable = getBasisTable();
  const textContent = queryTextContent(
    basisTable,
    "tr:nth-child(1) td",
    "実働日数"
  );
  return Number(textContent);
}

function getMissPunchedTimes(): Time[] {
  const rows = getCalendarTable().querySelectorAll("tr:not(:nth-child(1))"); // 1行目はヘッダ
  if (rows === null) {
    throw new Error("rows cannot be gotten from calendar");
  }
  return Array.from(rows)
    .filter((row) => queryTextContent(row, "td:nth-child(2)", "row") === "") // 公休などを除外
    .map<[string, string]>((row) => [
      queryTextContent(row, "td:nth-child(4)", "出勤時刻"),
      queryTextContent(row, "td:nth-child(5)", "退勤時刻"),
    ])
    .filter(
      ([start, end]) =>
        (start == "" && end !== "") || (start !== "" && end === "")
    ) // どちらかは空である
    .map<Time>(([start, end]) => {
      // 打刻されてない時間の補正
      const startTime = parseTime(start === "" ? "10:30" : start);
      const endTime = parseTime(end === "" ? "19:30" : end);
      return subtractTime(endTime, startTime);
    });
}

function getWorkingTimeTable(): HTMLTableElement {
  return document.querySelectorAll("table")[3];
}

function getBasisTable(): HTMLTableElement {
  return document.querySelectorAll("table")[2];
}

function getCalendarTable(): HTMLTableElement {
  const table = Array.from(document.querySelectorAll("table")).at(-1);
  if (table === undefined) {
    throw new Error("not get calendar table");
  }
  return table;
}

function queryTextContent(
  element: Element,
  selector: string,
  label: string
): string {
  const result = element.querySelector(selector)?.textContent;
  if (result === null || result === undefined) {
    throw new Error(`${label} not be there`);
  }
  return result;
}

main();
