import { describe, it } from "vitest";
import { ScheduleParser } from "~/ScheduleParser";
import { email092423 } from "~/tests/fixtures/email-092423";

describe("a real email", () => {
  it("works?", () => {
    const result = new ScheduleParser(email092423).parse()
  });
});
