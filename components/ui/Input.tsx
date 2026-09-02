"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

/* ── Size Map ──────────────────────────────────────────────── */

const sizeClasses = {
  sm: "h-8 px-3 text-xs rounded-lg",
  md: "h-10 px-3.5 text-sm rounded-xl",
  lg: "h-12 px-4 text-base rounded-xl",
} as const;

export type InputSize = keyof typeof sizeClasses;

/* ── Props ─────────────────────────────────────────────────── */

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Visual size variant */
  size?: InputSize;
  /** Label displayed above the input */
  label?: string;
  /** Helper text displayed below the input */
  helperText?: string;
  /** Error message — replaces helperText and applies error styles */
  error?: string;
  /** Icon or element rendered inside the left side of the input */
  leftIcon?: ReactNode;
  /** Icon or element rendered inside the right side of the input */
  rightIcon?: ReactNode;
  /** Makes the input span full width of its container */
  fullWidth?: boolean;
}

/* ── Component ─────────────────────────────────────────────── */

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = "md",
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const hasError = Boolean(error);

    return (
      <div className={`flex flex-col gap-1.5 ${fullWidth ? "w-full" : ""}`}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted [&>svg]:h-4 [&>svg]:w-4 pointer-events-none">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={[
              // Base
              "w-full font-sans",
              "bg-surface text-foreground placeholder:text-muted-foreground",
              "border transition-all duration-200 ease-out",
              "focus-ring",
              // Size
              sizeClasses[size],
              // Icons padding
              leftIcon ? "pl-9" : "",
              rightIcon ? "pr-9" : "",
              // Border state
              hasError
                ? "border-destructive-400 focus:border-destructive-500"
                : "border-border hover:border-border-hover focus:border-brand-500",
              // Disabled
              disabled ? "opacity-50 cursor-not-allowed" : "",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            {...props}
          />

          {/* Right icon */}
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted [&>svg]:h-4 [&>svg]:w-4">
              {rightIcon}
            </span>
          )}
        </div>

        {/* Helper / Error text */}
        {(error || helperText) && (
          <p
            className={`text-xs ${
              hasError ? "text-destructive-400" : "text-muted-foreground"
            }`}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input };
