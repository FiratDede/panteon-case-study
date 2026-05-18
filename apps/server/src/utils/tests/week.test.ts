import { describe, expect, it } from "vitest";
import { getCurrentWeekId, getDefaultWeekWindow } from "../week.js";

describe("week utilities", () => {
  it("builds the current ISO week id from a date", () => {
    expect(getCurrentWeekId(new Date("2026-05-18T12:00:00.000Z"))).toBe("2026-W21");
  });

  it("builds the UTC window for an ISO week id", () => {
    const window = getDefaultWeekWindow("2026-W21");

    expect(window.startsAt.toISOString()).toBe("2026-05-18T00:00:00.000Z");
    expect(window.endsAt.toISOString()).toBe("2026-05-25T00:00:00.000Z");
  });
});
