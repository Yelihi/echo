export type DiffToken = {
  text: string;
  comparable: string;
};

export type DiffPart = {
  op: "equal" | "insert" | "delete" | "replace";
  expected: string[];
  actual: string[];
};
