"use client";
import { Select } from "radix-ui";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import type { HistorySelectProps } from "../models/interface";

export function HistorySelect({
  label,
  value,
  options,
  icon: Icon,
  disabled,
  onValueChange,
}: HistorySelectProps) {
  return (
    <Select.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <Select.Trigger
        aria-label={label}
        className="group inline-flex h-10 min-w-36 items-center gap-2.5 rounded-lg border border-gray-border bg-white px-3 text-sm font-medium text-black-primary shadow-sm outline-none transition-colors hover:border-neutral-400 hover:bg-neutral-50 focus-visible:border-blue-primary focus-visible:ring-2 focus-visible:ring-blue-primary/20 disabled:cursor-wait disabled:opacity-50 data-[state=open]:border-blue-primary"
      >
        <Icon aria-hidden className="size-4 shrink-0 text-gray-text" strokeWidth={1.75} />
        <span className="flex-1 whitespace-nowrap text-left">
          <Select.Value />
        </span>
        <Select.Icon asChild>
          <ChevronDown
            aria-hidden
            className="size-3.5 text-gray-text transition-transform group-data-[state=open]:rotate-180"
          />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={6}
          align="end"
          className="z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg border border-gray-border bg-white p-1.5 shadow-lg"
        >
          <Select.ScrollUpButton className="flex justify-center py-1">
            <ChevronUp className="size-4" />
          </Select.ScrollUpButton>
          <Select.Viewport>
            <Select.Group>
              <Select.Label className="px-2.5 pb-2 pt-1 text-xs font-medium text-gray-text">
                {label}
              </Select.Label>
              {options.map((option) => (
                <Select.Item
                  key={option.value}
                  value={option.value}
                  className="relative flex min-h-10 cursor-default select-none items-center gap-2.5 rounded-md py-2 pl-2.5 pr-9 text-sm text-black-primary outline-none data-[highlighted]:bg-neutral-100 data-[state=checked]:bg-blue-secondary/50 data-[state=checked]:font-semibold"
                >
                  {option.dotClassName && (
                    <span
                      aria-hidden
                      className={`size-1.5 shrink-0 rounded-full ${option.dotClassName}`}
                    />
                  )}
                  <Select.ItemText>{option.label}</Select.ItemText>
                  <Select.ItemIndicator className="absolute right-2.5 text-blue-primary">
                    <Check className="size-4" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Group>
          </Select.Viewport>
          <Select.ScrollDownButton className="flex justify-center py-1">
            <ChevronDown className="size-4" />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
