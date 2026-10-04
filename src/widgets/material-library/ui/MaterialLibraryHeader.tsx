import Link from "next/link";
import { Plus } from "lucide-react";
import type { MaterialLibraryHeaderProps } from "../models/interface";
import styles from "./MaterialLibrary.module.css";

export function MaterialLibraryHeader({
  eyebrow,
  title,
  description,
  createHref,
}: MaterialLibraryHeaderProps) {
  return (
    <header className={styles.header}>
      <div>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <Link href={createHref}>
        <Plus size={16} aria-hidden />새 자료 만들기
      </Link>
    </header>
  );
}
