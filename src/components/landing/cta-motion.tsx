"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function CtaMotion({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Positioning, not animation — keeps the glow centered in every mode.
      gsap.set("[data-cta-glow]", { xPercent: -50 });

      const mm = gsap.matchMedia();

      mm.add(
        "(prefers-reduced-motion: no-preference)",
        () => {
          // The glow blooms as the card scrolls into view.
          gsap.fromTo(
            "[data-cta-glow]",
            { scale: 0.55, opacity: 0.3 },
            {
              scale: 1.4,
              opacity: 1,
              ease: "none",
              scrollTrigger: {
                trigger: root.current,
                start: "top bottom",
                end: "center center",
                scrub: true,
              },
            }
          );

          // Content rises in once the card enters the viewport.
          gsap.from("[data-cta-enter]", {
            y: 18,
            autoAlpha: 0,
            duration: 0.6,
            ease: "power2.out",
            stagger: 0.1,
            scrollTrigger: {
              trigger: root.current,
              start: "top 78%",
              once: true,
            },
          });
        },
        root
      );

      return () => mm.revert();
    },
    { scope: root }
  );

  return <div ref={root}>{children}</div>;
}
