"use client";

import React, { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}


export function ScrollReveal({ children, className = "", delay = 0 }: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isArmed, setIsArmed] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = domRef.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // The observer fires immediately on observe with the current
    // intersection state, so below-fold elements hide via callback.
    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries[0].isIntersecting;
        setIsArmed(true);
        setIsVisible(intersecting);
        if (intersecting) observer.disconnect();
      },
      { threshold: 0.1 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={domRef}
      className={`${isArmed ? "transition-all duration-700 ease-out" : ""} ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
