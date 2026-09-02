"use client";

import { useEffect, useRef, useState } from "react";

export default function FadeInSection({
  children,
  delay = 0,
  trigger = "mount",
}: {
  children: React.ReactNode;
  delay?: number;
  /** "mount" fades in `delay`ms after the page loads; "view" fades in once scrolled into the viewport. */
  trigger?: "mount" | "view";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (trigger === "mount") {
      const timer = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [trigger, delay]);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : trigger === "view" ? "opacity-0 translate-y-6" : "opacity-0 translate-y-4"
      }`}
    >
      {children}
    </div>
  );
}
