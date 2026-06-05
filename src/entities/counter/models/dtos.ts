import type { CounterStatus } from "./enums";

export interface CounterDto {
  id: string;
  value: number;
  status: CounterStatus;
}
