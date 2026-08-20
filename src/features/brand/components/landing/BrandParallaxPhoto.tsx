"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

import { cn } from "@/lib/utils";

type BrandParallaxPhotoProps = {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  sizes?: string;
  /** Heroes start on screen; sections enter from below. */
  variant?: "hero" | "section";
};

export function BrandParallaxPhoto({
  src,
  alt,
  className,
  imageClassName,
  priority = false,
  sizes = "100vw",
  variant = "section",
}: BrandParallaxPhotoProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset:
      variant === "hero"
        ? ["start start", "end start"]
        : ["start end", "end start"],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? ["0%", "0%"] : variant === "hero" ? ["-6%", "18%"] : ["-16%", "16%"],
  );

  return (
    <div ref={ref} className={cn("relative overflow-hidden bg-[color:var(--landing-warm)]", className)}>
      <motion.div
        style={{ y }}
        className="absolute inset-x-0 -top-[20%] h-[140%] w-full will-change-transform"
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          quality={90}
          className={cn("scale-110 object-cover", imageClassName)}
          sizes={sizes}
        />
      </motion.div>
    </div>
  );
}
