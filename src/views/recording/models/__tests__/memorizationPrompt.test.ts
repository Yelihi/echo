import { expect, it } from "@jest/globals";
import { getMemorizationPrompt } from "../memorizationPrompt";

const paragraphs = [
  { label: "문단 1", text: "Hello.", translation: "안녕하세요." },
  { label: "문단 2", text: "Goodbye.", translation: "안녕히 가세요." },
];
it("본문 모드는 현재 문단의 영어를 표시한다", () => {
  expect(getMemorizationPrompt("read", "Title", paragraphs[0])).toMatchObject({
    text: "Hello.",
    lang: "en",
  });
  expect(getMemorizationPrompt("read", "Title", paragraphs[1])).toMatchObject({ text: "Goodbye." });
});
it("번역 모드는 한국어만 표시한다", () => {
  expect(getMemorizationPrompt("translate", "Title", paragraphs[0])).toMatchObject({
    text: "안녕하세요.",
    lang: "ko",
  });
});
it("제목 모드는 본문과 번역을 포함하지 않는다", () => {
  expect(getMemorizationPrompt("title", "Title", paragraphs[0])).toEqual({
    kind: "title",
    title: "Title",
  });
});
it("번역이나 문단이 없으면 원문을 노출하지 않고 녹음을 막는다", () => {
  const prompt = getMemorizationPrompt("translate", "Title", {
    label: "문단 1",
    text: "Secret English",
    translation: " ",
  });
  expect(prompt).toMatchObject({ unavailable: true, lang: "ko" });
  expect(JSON.stringify(prompt)).not.toContain("Secret English");
  expect(getMemorizationPrompt("read", "Title")).toMatchObject({ unavailable: true });
});
