import React from "react";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  badge,
  actions,
  className = "",
}: PageHeaderProps) {
  return (
    <header
      className={`h-16 flex-shrink-0 bg-white border-b border-[#DCE5DF] px-6 lg:px-8 flex items-center justify-between sticky top-0 z-10 ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg lg:text-xl font-semibold text-[#24312B] tracking-tight leading-none truncate">
              {title}
            </h1>
            {badge}
          </div>
          {subtitle && (
            <p className="text-xs text-[#69766F] mt-1 truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {actions && (
        <div className="flex items-center gap-3 flex-shrink-0">
          {actions}
        </div>
      )}
    </header>
  );
}
