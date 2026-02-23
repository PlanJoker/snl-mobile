// Design: Dark Brutalism — SNL brand card with optional glow
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className, glow, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-[#0a3d39] border border-[rgba(255,220,115,0.12)] rounded-2xl p-4",
        glow && "shadow-[0_0_20px_rgba(255,220,115,0.08)]",
        onClick && "cursor-pointer active:scale-[0.98] transition-transform duration-100",
        className
      )}
    >
      {children}
    </div>
  );
}
