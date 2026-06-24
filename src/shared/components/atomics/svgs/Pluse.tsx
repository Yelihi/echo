interface PluseProps {
  className?: string;
}

export function Pluse({ className }: PluseProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 40"
      width="32"
      height="40"
    >
      <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <line x1="4" y1="16" x2="4" y2="24" />
        <line x1="10" y1="11" x2="10" y2="29" />
        <line x1="16" y1="6" x2="16" y2="34" />
        <line x1="22" y1="11" x2="22" y2="29" />
        <line x1="28" y1="16" x2="28" y2="24" />
      </g>
    </svg>
  );
}
