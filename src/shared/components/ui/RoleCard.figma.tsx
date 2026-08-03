import figma from "@figma/code-connect";

import { RoleCard } from "@/shared/components/ui/RoleCard";

/**
 * Figma: Echo Design System › RoleCard
 */
figma.connect(RoleCard, "<ECHO_DS>?node-id=31-12", {
  props: {
    title: figma.string("Title"),
    description: figma.string("Description"),
    selected: figma.enum("Selected", {
      true: true,
      false: false,
    }),
  },
  example: ({ title, description, selected }) => (
    <RoleCard title={title} description={description} selected={selected} />
  ),
});
