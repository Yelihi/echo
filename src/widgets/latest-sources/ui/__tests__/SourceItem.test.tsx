import { expect, it } from "@jest/globals";
import "@testing-library/jest-dom/jest-globals";
import { render, screen } from "@testing-library/react";
import { MessageSquare } from "lucide-react";

import { SourceItem } from "@/widgets/latest-sources/ui/SourceItem";

it.each(["/role-playing/material-1/ready", "/sentence-memorization/material-2/ready", undefined])(
  "renders a usable link only when a material URL exists: %s",
  (href) => {
    render(
      <SourceItem
        icon={MessageSquare}
        type="role-play"
        title="최근 연습"
        subTitle="문장 3개"
        href={href}
      />,
    );

    if (href) {
      expect(screen.getByRole("link", { name: /최근 연습/ })).toHaveAttribute("href", href);
    } else {
      expect(screen.queryByRole("link")).not.toBeInTheDocument();
      expect(screen.getByText("최근 연습").closest("[aria-disabled]")).toHaveAttribute(
        "aria-disabled",
        "true",
      );
    }
  },
);
