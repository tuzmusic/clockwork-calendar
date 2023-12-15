import { describe, expect, it } from "vitest";
import fixture from "./fixtures/july-august-only";
import { ScheduleParser } from "~/ScheduleParser";
import { checkStrong } from "mdast-util-to-markdown/lib/util/check-strong";
import dayjs from "dayjs";

const NUM_GIGS = 10;
/**/
// const html = fs.readFileSync('./fixtures')

describe("parsing", () => {
  const parsed = new ScheduleParser(fixture).parse();

  const checkEventTimes = (
    eventIndex: number,
    testStart: [number, number] | null,
    testEnd?: [number, number],
  ) => {
    const { startTime: startTimeStr, endTime: endTimeStr } = parsed[eventIndex];
    const [startTime, endTime] = [startTimeStr, endTimeStr].map(dayjs);
    if (testStart)
      expect([startTime.hour(), startTime.minute()]).toEqual(testStart);
    if (testEnd) expect([endTime.hour(), endTime.minute()]).toEqual(testEnd);
  };

  it("parses the correct number of events", function () {
    expect(parsed).length(NUM_GIGS);
  });

  it("handles events that end before midnight", () => {
    const { startTime: startTimeStr, endTime: endTimeStr } = parsed[7];
    const [startTime, endTime] = [startTimeStr, endTimeStr].map(dayjs);
    expect(startTime.date()).toEqual(18);
    expect(endTime.date()).toEqual(18);
    checkEventTimes(7, [19, 0], [23, 0]);
  });

  it("handles events that end at midnight", () => {
    const { startTime: startTimeStr, endTime: endTimeStr } = parsed[5];
    const [startTime, endTime] = [startTimeStr, endTimeStr].map(dayjs);
    // don't need to check start time
    expect(startTime.date()).toEqual(11);
    expect(endTime.date()).toEqual(12);
    expect(endTime.hour()).toEqual(0);
  });

  it("sets the correct start time for a ceremony", function () {
    checkEventTimes(1, [16, 30], [22, 30]);
  });

  it("sets the correct start time for a ceremony for an event that also has cocktails", function () {
    const { startTime: startTimeStr, endTime: endTimeStr } = parsed[1];
    const [startTime, endTime] = [startTimeStr, endTimeStr].map(dayjs);
    expect([startTime.hour(), startTime.minute()]).toEqual([16, 30]);
    expect([endTime.hour(), endTime.minute()]).toEqual([22, 30]);
  });

  it("sets the correct start time for a cocktail hour", function () {
    checkEventTimes(8, [17, 0], [22, 0]);
  });

  it("ignores a ceremony that the user is not involved in, with cocktails", () => {
    checkEventTimes(4, [17, 30], [22, 30]);
  });

  it("marks a new event", () => {
    const newEvents = parsed.filter((e) => e.isNew);
    expect(newEvents).toHaveLength(1);
    const [event] = newEvents;
    const startTime = dayjs(event.startTime);
    // make sure it's the right one!
    expect(startTime.month()).toEqual(6); // months are zero-indexed
    expect(startTime.date()).toEqual(21);
  });
});
