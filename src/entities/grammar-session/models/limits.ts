/** 저장 노트의 원문과 전체 문장 답안에 적용하는 UTF-16 길이 한도입니다. */
export const GRAMMAR_ANSWER_MAX_LENGTH = 4000;
/**
 * 부분 회상은 최대 200개 구간의 ID(각 100자)와 답안을 JSON으로 저장합니다.
 * ID/원문 이스케이프 오버헤드를 수용하도록 직렬화 길이를 별도로 제한합니다.
 * 실제 문장 입력의 4,000자 한도를 늘리는 값은 아닙니다.
 */
export const GRAMMAR_PARTIAL_DRAFT_MAX_LENGTH = 262144;
