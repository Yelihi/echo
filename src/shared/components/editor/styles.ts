// Shared Tailwind recipes for the role-play and memorization editors.
// Keep field styles on the input itself so primitive variants merge without !important.
const input =
  "rounded-[7px] border border-practice-input-line bg-white px-3.5 py-2.75 text-[15px] leading-[1.7] font-normal text-practice-body shadow-practice-input placeholder:text-practice-muted focus:border-practice-focus focus:ring-2 focus:ring-practice-accent/6 focus:outline-none focus-visible:border-practice-focus focus-visible:inset-ring-0";

export const editorStyles = {
  editor: "flex w-full min-w-0 flex-col gap-7.5",
  header:
    "mb-1 flex items-start justify-between gap-6 [&_h1]:text-[32px] [&_h1]:leading-[1.4] [&_h1]:font-medium [&_h1]:tracking-[-1px] [&_p]:mt-2.5 [&_p]:text-[14px] [&_p]:leading-[1.8] [&_p]:text-practice-muted max-compact:flex-col max-compact:gap-5 max-compact:[&_h1]:text-[26px] max-compact:[&_p]:text-[13px]",
  actions:
    "flex shrink-0 gap-2.5 [&_button]:min-h-11 [&_button]:rounded-[7px] [&_button]:text-[13px] [&_button]:font-medium max-compact:self-end",
  panels: "flex flex-col gap-6.5",
  columns: "grid grid-cols-2 items-start gap-6 max-editor:grid-cols-1",
  panel:
    "min-w-0 rounded-[14px] border border-practice-panel-line bg-white p-8 shadow-practice-panel max-editor:p-6.5 max-compact:px-4.5 max-compact:py-5.5",
  panelHeading:
    "mb-7 flex items-center justify-between gap-5 [&_h2]:text-[19px] [&_h2]:font-medium [&_h2]:text-practice-body [&>span]:text-[12px] [&>span]:text-practice-muted [&_button]:min-h-10 [&_button]:w-auto [&_button]:border-0 [&_button]:bg-transparent [&_button]:p-0 [&_button]:text-[12px] [&_button]:text-practice-secondary max-compact:items-start max-compact:gap-3 max-compact:[&_h2]:text-[17px]",
  fieldGrid: "grid grid-cols-2 gap-x-9 gap-y-6.25 max-compact:grid-cols-1 max-compact:gap-5.5",
  field:
    "flex min-w-0 flex-col gap-2.5 [&>span]:text-[13px] [&>span]:font-normal [&>span]:text-practice-muted",
  fieldLabel: "text-[13px] font-normal text-practice-muted",
  input,
  tagInput:
    "min-h-12 rounded-[7px] border-practice-input-line bg-white px-2.5 py-1.25 [&_input]:h-8 [&_input]:border-0 [&_input]:bg-white [&_input]:p-0 [&_input]:text-[15px] [&_input]:leading-[1.7] [&_input]:font-normal [&_input]:text-practice-body [&_input]:shadow-none [&_input::placeholder]:text-practice-muted [&_[data-slot=tag-input-chip]]:rounded [&_[data-slot=tag-input-chip]]:border-0 [&_[data-slot=tag-input-chip]]:bg-practice-chip [&_[data-slot=tag-input-chip]]:text-[12px] [&_[data-slot=tag-input-chip]]:text-practice-secondary [&_[data-slot=tag-input-chip]_button]:h-8 [&_[data-slot=tag-input-chip]_button]:w-6.5",
  fullWidth: "col-span-full",
  caption: "mt-3 text-[12px] leading-[1.8] text-practice-muted",
  scriptHeading:
    "grid grid-cols-[32px_105px_minmax(0,1fr)_44px] gap-3.5 border-b border-practice-panel-line pb-3 text-[11px] text-practice-muted max-compact:hidden",
  scriptList: "flex min-h-52.5 flex-col",
  scriptRow:
    "grid grid-cols-[32px_105px_minmax(0,1fr)_44px] items-start gap-3.5 border-b border-practice-panel-line py-5 max-compact:grid-cols-[22px_1fr_44px] max-compact:gap-2",
  lineNumber: "pt-3.75 text-[12px] text-practice-muted max-compact:pt-3.25",
  speaker:
    "flex min-h-12 items-center gap-2.5 text-[12px] text-practice-secondary data-[speaker=me]:text-practice-focus max-compact:min-h-11",
  scriptInput:
    "min-h-19.5 resize-y rounded-[7px] border border-practice-input-line bg-white px-4 py-3 text-[16px] leading-[1.8] text-practice-body focus:border-practice-focus focus:outline-none focus-visible:border-practice-focus max-compact:col-span-full max-compact:row-start-2",
  iconButton:
    "grid min-h-11 min-w-11 place-items-center rounded-md text-practice-subtle hover:bg-practice-accent-subtle hover:text-practice-focus max-compact:col-start-3 max-compact:row-start-1",
  addBar:
    "flex justify-start gap-3 pt-6 [&_button]:flex [&_button]:min-h-11 [&_button]:items-center [&_button]:gap-2 [&_button]:rounded-md [&_button]:border [&_button]:border-practice-input-line [&_button]:bg-white [&_button]:px-4 [&_button]:py-0 [&_button]:text-[12px] [&_button]:text-practice-secondary max-compact:flex-wrap",
  sourceFields: "flex flex-col gap-6",
  bodyHeading: "mb-2.5 flex justify-between text-[12px] text-practice-muted",
  bodyInput: `${input} min-h-65 w-full resize-y`,
  suggest:
    "mt-6 [&>button]:min-h-11.5 [&>button]:rounded-[7px] [&>button]:border [&>button]:border-solid [&>button]:border-practice-input-line [&>button]:bg-white [&>button]:text-[13px] [&>button]:text-black-secondary",
  reviewList: "flex min-h-67.5 flex-col gap-6",
  paragraphRow:
    "gap-3 [&>span]:mt-2.5 [&>span]:bg-transparent [&>span]:text-[12px] [&>span]:font-normal [&>span]:text-practice-muted",
  paragraphInput:
    "field-sizing-content resize-none overflow-hidden rounded-[7px] border border-practice-input-line bg-white p-3.25 text-[15px] leading-[1.8]",
  confirmBar:
    "mt-7 flex justify-end border-t border-practice-panel-line pt-5.5 [&_button]:rounded-[7px] [&_button]:text-[13px]",
  empty:
    "flex min-h-67.5 flex-col items-center justify-center gap-3 p-6 text-center text-[13px] leading-[1.8] text-practice-muted",
} as const;
