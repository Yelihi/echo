export type MemorizationEditorAction =
  | {
      type: "set_title";
      title: string;
    }
  | {
      type: "set_tags";
      tags: string[];
    }
  | {
      type: "set_raw_text";
      rawText: string;
    }
  | {
      type: "set_paragraphs";
      paragraphs: string[];
    }
  | {
      type: "update_paragraph";
      index: number;
      value: string;
    }
  | {
      type: "merge_paragraph";
      index: number;
    }
  | {
      type: "delete_paragraph";
      index: number;
    }
  | {
      type: "confirm_paragraphs";
      paragraphs: string[];
    };
