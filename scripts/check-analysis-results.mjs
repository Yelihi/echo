import assert from "node:assert/strict";
import console from "node:console";
import process from "node:process";
import { chromium } from "playwright";

const browser = await chromium.launch();
const base = process.env.STORYBOOK_URL ?? "http://localhost:6007";
try {
  for (const width of [390, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const state of ["partial", "failed"]) {
      await page.goto(
        `${base}/iframe.html?id=views-analysis-result-ui-analysisresultview--${state}`,
        { waitUntil: "domcontentloaded" },
      );
      await page.getByRole("button", { name: "다시 분석하기" }).waitFor();
      assert(await page.getByText("I would like a window seat.", { exact: true }).isVisible());
      if (state === "partial") {
        assert(
          await page
            .locator('[data-slot="chat-bubble"]')
            .filter({ hasText: "I want a window seat." })
            .isVisible(),
        );
        assert(
          await page
            .locator('[data-slot="chat-bubble"]')
            .filter({ hasText: "녹음의 발화를 문장으로 표시하지 못했습니다." })
            .isVisible(),
        );
        assert.equal(await page.locator("audio[controls]").count(), 2);
      }
      assert(
        await page.evaluate(
          () => globalThis.document.documentElement.scrollWidth <= globalThis.innerWidth,
        ),
      );
      await page.screenshot({ path: `/tmp/analysis-${state}-${width}.png`, fullPage: true });
    }
    await page.goto(`${base}/iframe.html?id=views-recording-recordingcompletionpanel--completed`, {
      waitUntil: "domcontentloaded",
    });
    await page.getByRole("heading", { name: "녹음을 마쳤습니다" }).waitFor();
    assert.equal(
      await page.getByRole("link", { name: "분석 결과 확인" }).getAttribute("href"),
      "/roleplay-sessions/example/result",
    );
    assert(await page.getByText("녹음이 모두 저장되었습니다.", { exact: false }).isVisible());
    assert(
      await page.evaluate(
        () => globalThis.document.documentElement.scrollWidth <= globalThis.innerWidth,
      ),
    );
    await page.screenshot({ path: `/tmp/recording-completion-${width}.png`, fullPage: true });
    assert.deepEqual(errors, []);
    console.log(
      JSON.stringify({
        width,
        partial: "passed",
        failed: "passed",
        completion: "passed",
        pageErrors: errors.length,
      }),
    );
    await page.close();
  }
} finally {
  await browser.close();
}
