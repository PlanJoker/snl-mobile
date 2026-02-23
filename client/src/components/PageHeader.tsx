// Design: Dark Brutalism — fixed top header with brand accent
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  accent?: boolean;
}

export default function PageHeader({ title, subtitle, right, accent = false }: PageHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 max-w-[480px] mx-auto">
      <div className="bg-[#012E2B]/95 backdrop-blur-xl border-b border-[rgba(255,220,115,0.12)] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {accent && (
              <div className="w-1 h-6 rounded-full bg-[#FFDC73]" />
            )}
            <div>
              <h1
                className="text-lg font-bold text-[#F8F8FF] leading-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-[#8fa8a5] mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          {right && <div className="flex items-center gap-2">{right}</div>}
        </div>
      </div>
    </header>
  );
}
