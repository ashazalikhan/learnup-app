"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

/* ── Variant & Size Maps ───────────────────────────────────── */

const variantClasses = {
  primary:
    "text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 shadow-md hover:shadow-lg",
  secondary:
    "text-brand-700 bg-brand-50 hover:bg-brand-100 active:bg-brand-200 dark:text-brand-300 dark:bg-brand-900/30 dark:hover:bg-brand-900/50",
  ghost:
    "text-foreground hover:bg-surface-hover active:bg-surface-active",
  destructive:
    "text-white bg-destructive-500 hover:bg-destructive-600 active:bg-destructive-600 shadow-md",
  outline:
    "text-foreground border border-border hover:border-border-hover hover:bg-surface-hover active:bg-surface-active",
  gradient:
    "text-white shadow-lg hover:shadow-xl",
} as const;

const sizeClasses = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-xl",
  lg: "h-12 px-6 text-base gap-2.5 rounded-xl",
  icon: "h-10 w-10 rounded-xl",
} as const;

export type ButtonVariant = keyof typeof variantClasses;
export type ButtonSize = keyof typeof sizeClasses;

/* ── Props ─────────────────────────────────────────────────── */

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  /** Renders a full-width button */
  fullWidth?: boolean;
}

/* ── Component ─────────────────────────────────────────────── */

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={[
          // Base
          "inline-flex items-center justify-center font-medium",
          "transition-all duration-200 ease-out",
          "focus-ring select-none",
          // Variant
          variantClasses[variant],
          // Size
          sizeClasses[size],
          // Gradient needs inline style but we add the utility class
          variant === "gradient" ? "gradient-button" : "",
          // Full width
          fullWidth ? "w-full" : "",
          // Disabled
          isDisabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "cursor-pointer",
          // Hover lift for solid variants
          !isDisabled && (variant === "primary" || variant === "gradient")
            ? "hover:-translate-y-0.5 active:translate-y-0"
            : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={
          variant === "gradient"
            ? { backgroundImage: "var(--gradient-brand)" }
            : undefined
        }
        {...props}
      >
        {/* Loading spinner */}
        {loading && (
          <svg
            className="animate-spin h-4 w-4 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
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
        )}

        {/* Left icon */}
        {!loading && leftIcon && (
          <span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4">{leftIcon}</span>
        )}

        {/* Label */}
        {size !== "icon" && children && <span>{children}</span>}
        {size === "icon" && children}

        {/* Right icon */}
        {rightIcon && (
          <span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
