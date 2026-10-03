import Link from "next/link";
import { Plus } from "lucide-react";
import styles from "./MaterialLibrary.module.css";
export function MaterialLibraryHeader({ type }: { type: "roleplay" | "memorization" }) {
  const roleplay = type === "roleplay";
  return (
    <header className={styles.header}>
      <div>
        <p className={styles.eyebrow}>{roleplay ? "ROLEPLAY" : "MEMORIZATION"}</p>
        <h1>{roleplay ? "롤플레잉" : "문단 암기"}</h1>
        <p>
          {roleplay
            ? "연습하고 싶은 대화를 고르고, 나의 말로 시작해보세요."
            : "기억하고 싶은 글을 고르고, 한 문단씩 내 것으로 만드세요."}
        </p>
      </div>
      <Link href={roleplay ? "/role-playing/new" : "/sentence-memorization/new"}>
        <Plus size={16} aria-hidden />새 자료 만들기
      </Link>
    </header>
  );
}
