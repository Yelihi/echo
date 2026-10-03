import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Custom typography must remain independent of text color when consumers override size.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display",
            "heading-lg",
            "heading-md",
            "heading-sm",
            "heading-xs",
            "subtitle-lg",
            "subtitle-md",
            "subtitle-sm",
            "body-1",
            "body-2",
            "body-3",
            "body-4",
            "body-5",
            "body-6",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
