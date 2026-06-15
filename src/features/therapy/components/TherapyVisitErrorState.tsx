import Image from "next/image";

import { BRAND_LOGO_SRC } from "@/constants/brand";

type TherapyVisitErrorStateProps = {
  message: string;
};

export function TherapyVisitErrorState({
  message,
}: TherapyVisitErrorStateProps) {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-6 py-12">
      <div
        className="w-full max-w-md bg-white px-8 py-10 text-center"
        role="alert"
      >
        <Image
          src={BRAND_LOGO_SRC}
          alt="Sigma Health"
          width={180}
          height={60}
          className="mx-auto h-14 w-auto object-contain"
          priority
        />
        <h1 className="mt-6 text-xl font-semibold text-brand-navy">
          Visit details unavailable
        </h1>
        <p className="mt-2 text-sm leading-6 text-brand-muted">{message}</p>
      </div>
    </div>
  );
}