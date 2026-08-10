import type { ReactNode } from "react";

import { Badge } from "@/shared/components/atomics/badge/Badge";
import { Card } from "@/shared/components/atomics/card/Card";
import { StatItem } from "@/shared/components/atomics/stat-item/StatItem";

interface SessionReadyHeroProps {
  tags: readonly string[];
  title: string;
  description: string;
  stats: Array<{ icon: ReactNode; label: string; value: ReactNode }>;
}

export function SessionReadyHero({ tags, title, description, stats }: SessionReadyHeroProps) {
  return (
    <Card className="flex flex-col gap-5 p-6">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge key={tag} value={tag} size="small" />
        ))}
      </div>
      <div>
        <h1 className="text-heading-md font-bold text-black-primary">{title}</h1>
        <p className="mt-2 text-body-3 text-gray-text">{description}</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <StatItem key={stat.label} {...stat} />
        ))}
      </div>
    </Card>
  );
}
