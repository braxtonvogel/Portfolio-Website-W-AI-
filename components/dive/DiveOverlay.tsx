import styles from "./dive.module.css";

/** Full-frame burst + flash used for the welcome <-> space warp. Mount/unmount this
 * component (don't just toggle a prop) so the CSS animations restart each time. */
export function DiveOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      <div className={styles.burst} />
      <div className={`${styles.burst} ${styles.b1}`} />
      <div className={`${styles.burst} ${styles.b2}`} />
      <div className={`${styles.burst} ${styles.b3}`} />
      <div className={`${styles.burst} ${styles.b4}`} />
      <div className={`${styles.burst} ${styles.b5}`} />
      <div className={styles.flash} />
    </div>
  );
}

/** Smaller burst used when flying between sections inside the space. Same
 * mount-to-restart rule as DiveOverlay. */
export function FlyPulse() {
  return (
    <div className={`absolute inset-0 pointer-events-none z-20 overflow-hidden ${styles.pulseRings}`}>
      <div className={styles.burst} />
      <div className={`${styles.burst} ${styles.b2}`} />
      <div className={`${styles.burst} ${styles.b4}`} />
    </div>
  );
}
