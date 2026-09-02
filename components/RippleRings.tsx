export default function RippleRings({ top, height }: { top: number; height: number }) {
  return (
    <div
      className="absolute inset-x-0 -z-10 pointer-events-none overflow-hidden"
      style={{ top, height }}
    >
      <div className="ripple-ring-static" />
      <div className="ripple-ring" />
      <div className="ripple-ring" />
      <div className="ripple-ring" />
      <div className="ripple-ring" />
      <div className="ripple-ring" />
    </div>
  );
}
