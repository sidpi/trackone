"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function HeroMotion({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Positioning, not animation — keeps the centered orb centered in every mode.
      gsap.set("[data-hero-glow-center]", { xPercent: -50 });

      const mm = gsap.matchMedia();

      mm.add(
        "(prefers-reduced-motion: no-preference)",
        () => {
          // Entrance cascade for the headline block and dashboard preview.
          gsap
            .timeline({ defaults: { ease: "power3.out" } })
            .from("[data-hero-enter]", {
              y: 28,
              autoAlpha: 0,
              duration: 0.8,
              stagger: 0.12,
            });

          // Flowing shimmer across the gradient-highlighted word.
          gsap.set("[data-hero-gradient]", {
            backgroundSize: "200% 100%",
            backgroundPosition: "0% 50%",
          });
          gsap.to("[data-hero-gradient]", {
            backgroundPosition: "200% 50%",
            duration: 4.5,
            ease: "none",
            repeat: -1,
            yoyo: true,
          });

          // Slow-rotating conic aurora behind the headline.
          gsap.to("[data-hero-aurora]", {
            rotation: 360,
            duration: 48,
            ease: "none",
            repeat: -1,
          });

          // Ambient orbs drift and breathe on their own rhythm.
          gsap.to("[data-hero-glow]", {
            x: () => gsap.utils.random(-40, 40),
            y: () => gsap.utils.random(-32, 32),
            scale: 1.2,
            duration: () => gsap.utils.random(7, 12),
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            stagger: { each: 1.6 },
          });

          // Parallax: glows drift downward as the section scrolls away.
          gsap.to("[data-hero-glow], [data-hero-aurora]", {
            yPercent: 40,
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: "bottom top",
              scrub: true,
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
