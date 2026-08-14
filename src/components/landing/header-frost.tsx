"use client";

import { useEffect } from "react";

/**
 * Frosted-glass navbar (CodeFronts glassmorphism pattern adapted):
 * a hidden 1px sentinel at the top of the page is watched by an
 * IntersectionObserver. While the sentinel is visible the header stays
 * transparent; once it scrolls out of view the header gets `.is-scrolled`
 * and morphs into a frosted glass bar. Zero animation libraries.
 */
export function HeaderFrost() {
  useEffect(() => {
    const nav = document.getElementById("site-header");
    const sentinel = document.getElementById("site-header-sentinel");
    if (!nav || !sentinel || !("IntersectionObserver" in window)) return;

    const io = new IntersectionObserver(
      (entries) => {
        // Sentinel intersecting → at the top → transparent.
        // Sentinel gone → scrolled → frosted glass.
        nav.classList.toggle("is-scrolled", !entries[0].isIntersecting);
      },
      { threshold: 0 }
    );
    io.observe(sentinel);

    return () => io.disconnect();
  }, []);

  return (
    <div aria-hidden className="pointer-events-none relative">
      <div
        id="site-header-sentinel"
        className="absolute left-0 top-0 h-px w-px"
      />
    </div>
  );
}
