import { describe, expect, test } from "vitest";
import { addTime, parseTime, subtractTime, type Time } from "./time";

describe(parseTime.name, () => {
  test("parse time string", () => {
    // arrange
    const timeStr = "12:193";
    // act
    const result = parseTime(timeStr);
    // assert
    expect(result).toStrictEqual<Time>({ hour: 15, minute: 13 });
  });
});

describe(addTime.name, () => {
  test("add times", () => {
    // arrange
    const a: Time = { hour: 3, minute: 45 };
    const b: Time = { hour: 8, minute: 32 };
    // act
    const result = addTime(a, b);
    // assert
    expect(result).toStrictEqual<Time>({ hour: 12, minute: 17 });
  });

  test("add times(negative)", () => {
    // arrange
    const a: Time = { hour: 3, minute: 25 };
    const b: Time = { hour: 8, minute: -100 };
    // act
    const result = addTime(a, b);
    // assert
    expect(result).toStrictEqual<Time>({ hour: 10, minute: -15 });
  });
});

describe(subtractTime.name, () => {
  test("subtract times", () => {
    // arrange
    const a: Time = { hour: 12, minute: 68 };
    const b: Time = { hour: 4, minute: 49 };
    // act
    const result = subtractTime(a, b);
    // assert
    expect(result).toStrictEqual<Time>({ hour: 8, minute: 19 });
  });

  test("subtract times(negative)", () => {
    // arrange
    const a: Time = { hour: 9, minute: 6 };
    const b: Time = { hour: 11, minute: 100 };
    // act
    const result = subtractTime(a, b);
    // assert
    expect(result).toStrictEqual<Time>({ hour: -3, minute: -34 });
  });
});
