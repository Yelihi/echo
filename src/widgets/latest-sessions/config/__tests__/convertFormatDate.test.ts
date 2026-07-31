import { describe, expect, it } from "@jest/globals";

import { convertFormatDate } from "@/widgets/latest-sessions/config/convertFortmatDate";

describe("convertFormatDate", () => {
  it("formats today by Asia/Seoul time instead of server local time", () => {
    expect(
      convertFormatDate(
        new Date("2026-07-31T09:00:00+09:00"),
        new Date("2026-07-31T12:00:00+09:00"),
      ),
    ).toBe("오늘 09:00");
  });

  it("compares relative days by Asia/Seoul date", () => {
    expect(
      convertFormatDate(
        new Date("2026-07-30T23:30:00+09:00"),
        new Date("2026-07-31T00:30:00+09:00"),
      ),
    ).toBe("어제 23:30");
  });
});
