"use client";

import { useId } from "react";
import { getTextBoundaries } from "../services/textBoundaries";
import type { BoundarySelectProps } from "../models/interface";

export function BoundarySelect({
  label,
  source,
  value,
  min = 0,
  max = source.length,
  onChange,
  disabled,
}: BoundarySelectProps) {
  const id = useId();
  const options = getTextBoundaries(source).filter(
    (item) => item.position >= min && item.position <= max,
  );
  if (!options.some((item) => item.position === value))
    options.push({ position: value, label: `${source.slice(0, value)} │ ${source.slice(value)}` });
  return (
    <label htmlFor={id} className="block space-y-2 text-sm">
      {label}
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        className="block h-12 w-full min-w-0 truncate rounded-md border border-practice-input-line bg-white px-3 text-practice-body outline-none focus-visible:ring-2 focus-visible:ring-practice-focus disabled:opacity-50"
      >
        {options
          .sort((a, b) => a.position - b.position)
          .map((item) => (
            <option key={item.position} value={item.position}>
              {item.label}
            </option>
          ))}
      </select>
    </label>
  );
}
