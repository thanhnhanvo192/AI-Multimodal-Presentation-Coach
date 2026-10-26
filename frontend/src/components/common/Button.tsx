import React from "react";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      className = "",
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none select-none";

    const variantStyles: Record<ButtonVariant, string> = {
      primary:
        "bg-[#276749] hover:bg-[#1F553C] text-white focus:ring-[#276749] active:scale-[0.99]",
      secondary:
        "bg-white hover:bg-[#F5F7F6] text-[#24312B] border border-[#DCE5DF] focus:ring-[#276749] active:scale-[0.99]",
      danger:
        "bg-[#C24141] hover:bg-[#A83232] text-white focus:ring-[#C24141] active:scale-[0.99]",
      ghost:
        "bg-transparent hover:bg-[#E8F1EB] text-[#69766F] hover:text-[#276749] focus:ring-[#276749]",
    };

    const sizeStyles: Record<ButtonSize, string> = {
      sm: "h-9 px-3 text-[13px] gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-11 px-5 text-[15px] gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
