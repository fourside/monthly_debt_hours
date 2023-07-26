import { describe, expect, test } from "vitest";
import { addTime, greaterThanOrEqual, parseTime, subtractTime, type Time } from "./time";

describe(parseTime.name, () => {
  test("parse time string", () => {
    // arrange
    const timeStr = "12:193";
    // act
    const result = parseTime(timeStr);
    // assert
    expect(result).toStrictEqual<Time>({ hour: 15, minute: 13 });
  });

  test("parse throws error if not hh:mm string is taken", () => {
    // arrange
    const timeStr = "string";
    // act & assert
    expect(() => parseTime(timeStr)).toThrowError();
  });

  test("parse throws error if hour is not number", () => {
    // arrange
    const timeStr = "abc:34";
    // act & assert
    expect(() => parseTime(timeStr)).toThrowError();
  });

  test("parse throws error if minute is not number", () => {
    // arrange
    const timeStr = "12:abc";
    // act & assert
    expect(() => parseTime(timeStr)).toThrowError();
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
    expect(result).toStrictEqual<Time>({ hour: 9, minute: 45 });
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
    expect(result).toStrictEqual<Time>({ hour: -4, minute: 26 });
  });
});

describe(greaterThanOrEqual.name, () => {
  test("12:40 is greater than 9:50", () => {
    // arrange
    const a: Time = { hour: 12, minute: 40 };
    const b: Time = { hour: 9, minute: 50 };
    // act
    const result = greaterThanOrEqual(a, b);
    // assert
    expect(result).toBe(true);
  });

  test("8:15 is NOT greater than 23:03", () => {
    // arrange
    const a: Time = { hour: 8, minute: 15 };
    const b: Time = { hour: 23, minute: 3 };
    // act
    const result = greaterThanOrEqual(a, b);
    // assert
    expect(result).toBe(false);
  });

  test("4:43 is greater than or equal 4:43", () => {
    // arrange
    const a: Time = { hour: 4, minute: 43 };
    const b: Time = { hour: 4, minute: 43 };
    // act
    const result = greaterThanOrEqual(a, b);
    // assert
    expect(result).toBe(true);
  });
});
