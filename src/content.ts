import type { WorkingStats } from "./popup-client";
import { addTime, greaterThanOrEqual, parseTime, subtractTime, type Time } from "./time";

function main(): void {
  chrome.runtime.onMessage.addListener((_message, _sender, sendResponse) => {
    const fixedTime = fixedWorkingTime();
    const pastTimes = getPastTimes();
    const actualTime = pastTimes.reduce<Time>((acc, cur) => addTime(acc, cur), { hour: 0, minute: 0 });
    const response: WorkingStats = {
      actualTime,
      fixedTime,
      actualDays: pastTimes.length,
    };
    sendResponse(response);
    return true;
  });
}

function fixedWorkingTime(): Time {
  const workingTimeTable = getWorkingTimeTable();
  const textContent = queryTextContent(workingTimeTable, "tr:nth-child(2) td", "月規定労働時間");
  return parseTime(textContent);
}

function getPastTimes(): Time[] {
  const rows = getCalendarTable().querySelectorAll("tr:not(:nth-child(1))"); // 1行目はヘッダ
  if (rows === null) {
    throw new Error("rows cannot be gotten from calendar");
  }
  const today = new Date().getDate();
  return Array.from(rows)
    .filter((row) => {
      // 実行日以前の日付の行が対象。今月のページで実行される前提。
      const dateString = queryTextContent(row, "td:nth-child(1)", "row");
      const day = Number(dateString.slice(3, 5)); // '07/14(金)' => 14
      return today > day;
    })
    .filter((row) => queryTextContent(row, "td:nth-child(2)", "row") === "") // 公休などを除外
    .map<[string, string, string]>((row) => [
      queryTextContent(row, "td:nth-child(4)", "出勤時刻"),
      queryTextContent(row, "td:nth-child(5)", "退勤時刻"),
      queryTextContent(row, "td:nth-child(10)", "休憩時間"),
    ])
    .map<Time>(([start, end, rest]) => {
      const [startTime, endTime] = parseWorkingTime(start, end);
      const restTime = rest === "" ? { hour: 1, minute: 0 } : parseTime(rest);
      return subtractTime(subtractTime(endTime, startTime), restTime);
    });
}

const START_TIME: Time = { hour: 10, minute: 30 };
const END_TIME: Time = { hour: 19, minute: 30 };

function parseWorkingTime(start: string, end: string): [Time, Time] {
  // 打刻されてない時間の補正。欠勤と打刻ミスの区別をしない。自然と有給も8hでカウントされる
  const startTime = start === "" ? START_TIME : parseTime(start);
  const endTime = end === "" ? END_TIME : parseTime(end);
  if (greaterThanOrEqual(startTime, { hour: 14, minute: 30 }) && end === "") {
    // 始業がある程度遅いかつ終業がない場合、始業打刻ミスで終業の打刻が始業扱いになっている
    return [START_TIME, startTime];
  }
  return [startTime, endTime];
}

function getWorkingTimeTable(): HTMLTableElement {
  return document.querySelectorAll("table")[3];
}

function getCalendarTable(): HTMLTableElement {
  const table = Array.from(document.querySelectorAll("table")).at(-1);
  if (table === undefined) {
    throw new Error("not get calendar table");
  }
  return table;
}

function queryTextContent(element: Element, selector: string, label: string): string {
  const result = element.querySelector(selector)?.textContent;
  if (result === null || result === undefined) {
    throw new Error(`${label} not be there`);
  }
  return result;
}

main();
