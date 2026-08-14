"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function FeaturesMotion({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        "(prefers-reduced-motion: no-preference)",
        () => {
          // Section heading rises in first, then the cards cascade in
          // one by one once the grid scrolls into view.
          gsap
            .timeline({
              defaults: { ease: "power2.out" },
              scrollTrigger: {
                trigger: root.current,
                start: "top 75%",
                once: true,
              },
            })
            .from("[data-features-head]", {
              y: 20,
              autoAlpha: 0,
              duration: 0.6,
            })
            .from(
              "[data-feature-card]",
              {
                y: 28,
                autoAlpha: 0,
                duration: 0.6,
                stagger: 0.12,
              },
              "-=0.35"
            );
        },
        root
      );

      return () => mm.revert();
    },
    { scope: root }
  );

  return <div ref={root}>{children}</div>;
}
