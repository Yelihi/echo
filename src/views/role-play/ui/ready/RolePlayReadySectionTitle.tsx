interface RolePlayReadySectionTitleProps {
  title: string;
  description: string;
}

export function RolePlayReadySectionTitle({ title, description }: RolePlayReadySectionTitleProps) {
  return (
    <div>
      <h2 className="text-[17px] leading-normal font-bold">{title}</h2>
      <p className="mt-1 text-[13.5px] text-gray-text">{description}</p>
    </div>
  );
}
