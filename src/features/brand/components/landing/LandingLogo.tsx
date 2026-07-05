import Image from "next/image";
import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import { LANDING_LOGO_SRC } from "@/features/brand/constants/landing-tokens";
import { cn } from "@/lib/utils";

type LandingLogoProps = {
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  linked?: boolean;
};

export function LandingLogo({
  className,
  imageClassName = "h-8 w-auto",
  priority = false,
  linked = true,
}: LandingLogoProps) {
  const image = (
    <Image
      src={LANDING_LOGO_SRC}
      alt="Sigma Health"
      width={148}
      height={48}
      className={cn("object-contain", imageClassName)}
      priority={priority}
    />
  );

  if (!linked) {
    return <span className={cn("inline-flex shrink-0", className)}>{image}</span>;
  }

  return (
    <Link href={ROUTES.home} className={cn("inline-flex shrink-0", className)}>
      {image}
    </Link>
  );
}
