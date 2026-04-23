"use client";

import { useContext } from "react";
import { EntityContext } from "@/lib/contexts/entity-context";

export function useEntity() {
  const ctx = useContext(EntityContext);
  if (!ctx) {
    throw new Error("useEntity must be used within an EntityProvider");
  }
  return ctx;
}
