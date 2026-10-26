import React from "react";

export type BadgeVariant = "primary" | "success" | "warning" | "danger" | "neutral";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  withDot?: boolean;
}

export function Badge({
  variant = "neutral",
  withDot = false,
  className = "",
  children,
  ...props
}: BadgeProps) {
  const variantStyles: Record<BadgeVariant, { container: string; dot: string }> = {
    primary: {
      container: "bg-[#E8F1EB] text-[#276749] border border-[#D4E5D9]",
      dot: "bg-[#276749]",
    },
    success: {
      container: "bg-[#E8F1EB] text-[#276749] border border-[#D4E5D9]",
      dot: "bg-[#276749]",
    },
    warning: {
      container: "bg-[#FEF9C3] text-[#B7791F] border border-[#FDE68A]",
      dot: "bg-[#B7791F]",
    },
    danger: {
      container: "bg-[#FEE2E2] text-[#C24141] border border-[#FECACA]",
      dot: "bg-[#C24141]",
    },
    neutral: {
      container: "bg-[#F5F7F6] text-[#69766F] border border-[#DCE5DF]",
      dot: "bg-[#69766F]",
    },
  };

  const current = variantStyles[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full select-none ${current.container} ${className}`}
      {...props}
    >
      {withDot && <span className={`w-1.5 h-1.5 rounded-full ${current.dot} flex-shrink-0`} aria-hidden="true" />}
      <span>{children}</span>
    </span>
  );
}
