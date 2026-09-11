"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

import { HeroSection } from "@/features/brand/components/HeroSection";
import { LandingProblemViewport } from "@/features/brand/components/landing/LandingProblemViewport";

export function LandingHomeIntro() {
  const reduceMotion = useReducedMotion();
  const problemRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: problemRef,
    offset: ["start end", "start start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.45]);

  return (
    <div>
      <div className="sticky top-0 z-0 min-h-[100dvh] overflow-hidden bg-white">
        <motion.div
          className="origin-[center_42%]"
          style={reduceMotion ? undefined : { scale, opacity }}
        >
          <HeroSection />
        </motion.div>
      </div>

      <div ref={problemRef} className="relative z-10 bg-white">
        <LandingProblemViewport />
      </div>
    </div>
  );
}
