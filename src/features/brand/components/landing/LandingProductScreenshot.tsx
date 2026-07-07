import Image from "next/image";

import { LandingProductMockupFrame } from "@/features/brand/components/landing/LandingProductMockupFrame";
import { cn } from "@/lib/utils";

type LandingProductScreenshotProps = {
  src: string;
  alt: string;
  title?: string;
  elevated?: boolean;
  className?: string;
};

export function LandingProductScreenshot({
  src,
  alt,
  title = "app.sigmahmis.com",
  elevated = false,
  className,
}: LandingProductScreenshotProps) {
  return (
    <LandingProductMockupFrame title={title} compact elevated={elevated} className={className}>
      <Image
        src={src}
        alt={alt}
        width={1440}
        height={900}
        className={cn("h-auto w-full object-cover object-top")}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
      />
    </LandingProductMockupFrame>
  );
}
