interface RolePlayReadySectionTitleProps {
  title: string;
  description: string;
}

export function RolePlayReadySectionTitle({ title, description }: RolePlayReadySectionTitleProps) {
  return (
    <div>
      <h2 className="text-heading-xs font-bold tracking-tight">{title}</h2>
      <p className="mt-1 text-body-3 text-gray-text">{description}</p>
    </div>
  );
}
