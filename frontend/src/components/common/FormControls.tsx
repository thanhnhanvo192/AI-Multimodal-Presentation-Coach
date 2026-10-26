import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, leftIcon, rightIcon, className = "", id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-[#24312B]">
            {label}
          </label>
        )}
        <div className="relative rounded-lg overflow-hidden flex items-center">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#69766F]">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full h-10 ${
              leftIcon ? "pl-9" : "pl-3.5"
            } ${rightIcon ? "pr-9" : "pr-3.5"} py-2 text-sm text-[#24312B] bg-white border ${
              error ? "border-[#C24141] focus:ring-[#C24141]" : "border-[#DCE5DF] focus:border-[#276749] focus:ring-[#276749]"
            } rounded-lg outline-none focus:ring-1 transition-colors placeholder:text-[#69766F]/60 disabled:bg-[#F5F7F6] disabled:text-[#69766F] ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#69766F]">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-[#C24141]">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[#69766F]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, helperText, error, className = "", id, children, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-medium text-[#24312B]">
            {label}
          </label>
        )}
        <div className="relative rounded-lg">
          <select
            id={selectId}
            ref={ref}
            className={`w-full h-10 pl-3.5 pr-8 py-2 text-sm text-[#24312B] bg-white border ${
              error ? "border-[#C24141] focus:ring-[#C24141]" : "border-[#DCE5DF] focus:border-[#276749] focus:ring-[#276749]"
            } rounded-lg outline-none focus:ring-1 transition-colors appearance-none cursor-pointer disabled:bg-[#F5F7F6] disabled:text-[#69766F] ${className}`}
            {...props}
          >
            {children}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#69766F]">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        {error ? (
          <p className="text-xs text-[#C24141]">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[#69766F]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = "Select";
