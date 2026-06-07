"use client";

import { PhoneInput } from "react-international-phone";

import { cn } from "@/lib/utils";

import "react-international-phone/style.css";

type PhoneNumberInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  hasError?: boolean;
  className?: string;
};

const phoneInputClassName =
  "h-full min-w-0 flex-1 border-0 bg-transparent px-3 py-2 text-sm shadow-none outline-none placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50";

const phoneCountryButtonClassName =
  "h-full shrink-0 border-0 bg-transparent px-3 shadow-none outline-none focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50";

export function PhoneNumberInput({
  value,
  onChange,
  disabled = false,
  hasError = false,
  className,
}: PhoneNumberInputProps) {
  return (
    <div
      className={cn(
        "customer-phone-input flex h-10 w-full overflow-hidden rounded-md border border-input bg-background transition-[border-color,box-shadow] focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/25",
        hasError &&
          "border-destructive focus-within:border-destructive focus-within:ring-destructive/25",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <PhoneInput
        defaultCountry="mw"
        preferredCountries={["mw"]}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="flex h-full w-full min-w-0"
        inputClassName={phoneInputClassName}
        countrySelectorStyleProps={{
          buttonClassName: phoneCountryButtonClassName,
        }}
        style={{
          width: "100%",
          height: "100%",
          ["--react-international-phone-border-color" as string]: "transparent",
          ["--react-international-phone-country-selector-border-color" as string]:
            "transparent",
        }}
      />
    </div>
  );
}
