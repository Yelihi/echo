import assert from "node:assert/strict";
import process from "node:process";
import console from "node:console";
import { chromium } from "playwright";

const baseUrl = process.env.STORYBOOK_URL ?? "http://localhost:6007";
const browser = await chromium.launch({
  args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"],
});
try {
  for (const ending of ["learner", "partner"]) {
    const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
    const events = [];
    page.on("console", (message) => {
      try {
        const event = JSON.parse(message.text());
        if (event.service === "echo-browser") events.push(event);
      } catch {
        return;
      }
    });
    await page.goto(
      `${baseUrl}/iframe.html?id=views-recording-role-play-ui-roleplayrecordingview--${ending}-ends-conversation&viewMode=story`,
    );
    if (ending === "partner") await page.getByRole("button", { name: "시작하기" }).click();
    const start = page.getByRole("button", { name: "녹음 시작", exact: true });
    await start.click();
    const deadline = Date.now() + 10000;
    while (
      !events.some((event) => event.operation === "recording.start" && event.phase === "succeeded")
    ) {
      assert.ok(Date.now() < deadline, "Microphone did not start");
      await page.waitForTimeout(100);
    }
    await page.waitForTimeout(1200);
    await page.getByRole("button", { name: "녹음 중지" }).click();
    await page.locator("audio[controls]").waitFor();
    assert.equal(
      await page.getByRole("button", { name: "다시 녹음", exact: true }).first().isDisabled(),
      true,
    );
    await page.getByRole("button", { name: "저장하기", exact: true }).click();
    if (ending === "partner")
      await page.getByText("Thank you. Have a lovely day!", { exact: true }).waitFor();
    await page.getByRole("heading", { name: "녹음을 마쳤습니다" }).waitFor();
    assert.equal(await page.getByRole("button", { name: "녹음 시작", exact: true }).count(), 0);
    console.log(
      `${ending} ending: completed`,
      events.map(({ operation, phase }) => `${operation}.${phase}`),
    );
    await page.close();
  }
} finally {
  await browser.close();
}
