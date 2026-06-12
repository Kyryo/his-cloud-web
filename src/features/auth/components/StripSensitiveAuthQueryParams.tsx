"use client";

import { useEffect } from "react";

import { stripSensitiveAuthSearchParams } from "@/lib/auth-url";

export function StripSensitiveAuthQueryParams() {
  useEffect(() => {
    stripSensitiveAuthSearchParams();
  }, []);

  return null;
}
