import { PracticeModeCarousel } from "./PracticeModeCarousel";
import styles from "./PracticeHub.module.css";

export function HomeView() {
  return (
    <div className={styles.hub}>
      <div className={styles.intro}>
        <p>YOUR ENGLISH, YOUR WAY</p>
        <h1>오늘은 어떻게 연습할까요?</h1>
      </div>
      <PracticeModeCarousel />
    </div>
  );
}
