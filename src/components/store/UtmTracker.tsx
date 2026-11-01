"use client";

import { useEffect } from "react";
import { captureUtmSource } from "@/lib/utils/utm";

export function UtmTracker() {
  useEffect(() => {
    captureUtmSource();
  }, []);

  return null;
}
