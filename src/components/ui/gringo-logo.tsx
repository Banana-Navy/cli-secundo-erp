import Image from "next/image";
import { cn } from "@/lib/utils";

interface GringoLogoProps {
  size?: number;
  className?: string;
}

/**
 * GringoAI logo — robot with mustache.
 * Sizes: 20px (search bar), 28px (chat bubble), 32px (dialog header), 56px (empty state).
 */
export function GringoLogo({ size = 32, className }: GringoLogoProps) {
  return (
    <Image
      src="/gringo-ai-logo.png"
      alt="GringoAI"
      width={size}
      height={size}
      className={cn("shrink-0 rounded-full", className)}
    />
  );
}
