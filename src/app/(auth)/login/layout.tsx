import { PageEnter } from "@/shared/components/motion/PageEnter";
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-lvh bg-card-surface">
      <PageEnter>{children}</PageEnter>
    </div>
  );
}
