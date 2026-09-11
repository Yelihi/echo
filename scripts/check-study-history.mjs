import assert from "node:assert/strict";
import console from "node:console";
import process from "node:process";
import { chromium } from "playwright";

const base = process.env.STORYBOOK_URL ?? "http://localhost:6007";
const browser = await chromium.launch();
try {
  for (const width of [390, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    page.setDefaultTimeout(15000);
    page.setDefaultNavigationTimeout(20000);
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(
      `${base}/iframe.html?id=views-latest-sessions-ui-latestsessionsview--paginated`,
      { waitUntil: "domcontentloaded" },
    );
    await page.getByRole("heading", { name: "학습 기록" }).waitFor();
    assert.equal(
      await page.getByRole("list", { name: "학습 기록 목록" }).locator(":scope > li").count(),
      10,
    );
    assert.equal(
      await page.getByRole("link", { name: "다음 페이지" }).getAttribute("href"),
      "/sessions?page=3",
    );
    assert.equal(
      await page.getByRole("combobox", { name: "분석 상태" }).textContent(),
      "전체 상태",
    );
    assert.equal(await page.getByRole("combobox", { name: "정렬 순서" }).textContent(), "최신순");
    assert.equal(await page.locator('a[href="/roleplay-sessions/0/result"]').count(), 1);
    assert(
      await page.evaluate(
        () => globalThis.document.documentElement.scrollWidth <= globalThis.innerWidth,
      ),
    );
    await page.screenshot({ path: `/tmp/study-history-${width}.png`, fullPage: true });
    await page.goto(
      `${base}/iframe.html?id=views-latest-sessions-ui-latestsessionsview--filtered-empty`,
      { waitUntil: "domcontentloaded" },
    );
    await page.getByRole("status").waitFor();
    assert(await page.getByText("해당 상태의 학습 기록이 없습니다.").isVisible());
    assert.equal(await page.getByRole("navigation", { name: "페이지네이션" }).count(), 0);
    assert.deepEqual(errors, []);
    console.info({
      width,
      rows: 10,
      pagination: "passed",
      empty: "passed",
      pageErrors: errors.length,
    });
    await page.goto(`${base}/iframe.html?id=views-latest-sessions-ui-historyfilters--default`);
    await page.getByRole("combobox", { name: "분석 상태" }).click();
    await page.getByRole("option", { name: "일부 실패", exact: true }).click();
    assert.equal(
      await page.getByRole("combobox", { name: "분석 상태" }).textContent(),
      "일부 실패",
    );
    const sort = page.getByRole("combobox", { name: "정렬 순서" });
    await sort.focus();
    await page.keyboard.press("Enter");
    await page.getByRole("option", { name: "최신순", exact: true }).focus();
    await page.keyboard.press("End");
    await page.waitForFunction(() =>
      globalThis.document.activeElement?.textContent?.includes("오래된순"),
    );
    await page.keyboard.press("Enter");
    await sort.getByText("오래된순", { exact: true }).waitFor();
    assert.equal(await sort.textContent(), "오래된순");
    await page.getByRole("combobox", { name: "분석 상태" }).click();
    await page.screenshot({ path: `/tmp/study-history-menu-${width}.png` });
    await page.keyboard.press("Escape");
    assert.deepEqual(errors, []);
    await page.close();
  }
} finally {
  await browser.close();
}
