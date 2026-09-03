import styles from "./dive.module.css";

/** Full-frame ring burst used for the welcome <-> space warp. Mount/unmount this
 * component (don't just toggle a prop) so the CSS animations restart each time.
 * `origin` is where the rings burst from (defaults to the center) - the dive
 * in bursts from the moon. */
export function DiveOverlay({ origin }: { origin?: { x: string; y: string } }) {
  const style = origin ? ({ "--ox": origin.x, "--oy": origin.y } as React.CSSProperties) : undefined;
  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden" style={style}>
      <div className={styles.burst} />
      <div className={`${styles.burst} ${styles.b1}`} />
      <div className={`${styles.burst} ${styles.b2}`} />
      <div className={`${styles.burst} ${styles.b3}`} />
      <div className={`${styles.burst} ${styles.b4}`} />
      <div className={`${styles.burst} ${styles.b5}`} />
    </div>
  );
}
