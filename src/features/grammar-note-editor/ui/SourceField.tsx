"use client";
import { useId } from "react";
import { Textarea } from "@/shared/components/atomics/textarea/Textarea";
import { useEditor } from "./EditorProvider";
export function SourceField({
  field,
  label,
  placeholder,
}: {
  field: "sentence" | "learningNote";
  label: string;
  placeholder: string;
}) {
  const id = useId();
  const value = useEditor((s) => s.source[field]);
  const error = useEditor((s) => s.fieldErrors[field]);
  const change = useEditor((s) => s.changeSource);
  const saving = useEditor((s) => s.pending === "save");
  return (
    <div className="space-y-3">
      <label htmlFor={id} className="text-sm font-medium text-black-primary">
        {label} <span className="text-gray-text">(필수)</span>
      </label>
      <Textarea
        id={id}
        value={value}
        onChange={(e) => change(field, e.target.value)}
        disabled={saving}
        required
        maxLength={4000}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className="min-h-32 rounded-xl border-card-line bg-white p-4 text-base leading-relaxed"
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
