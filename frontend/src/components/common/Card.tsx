import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "compact" | "normal" | "spacious";
  hoverable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ padding = "normal", hoverable = false, className = "", children, ...props }, ref) => {
    const paddingStyles = {
      none: "p-0",
      compact: "p-4",
      normal: "p-5 sm:p-6",
      spacious: "p-6 sm:p-8",
    };

    return (
      <div
        ref={ref}
        className={`bg-white border border-[#DCE5DF] rounded-xl ${paddingStyles[padding]} ${
          hoverable ? "card-hover transition-all" : ""
        } ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export function CardHeader({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex items-center justify-between pb-4 border-b border-[#DCE5DF] ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`text-[15px] sm:text-base font-semibold text-[#24312B] leading-snug tracking-tight ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-xs text-[#69766F] leading-relaxed mt-0.5 ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`pt-4 ${className}`} {...props}>
      {children}
    </div>
  );
}
