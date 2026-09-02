"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

/* ── Variant Styles ────────────────────────────────────────── */

const variantClasses = {
  primary:
    "text-white bg-brand-600 hover:bg-brand-500 active:bg-brand-700",
  secondary:
    "text-text-primary bg-surface-secondary border border-border hover:bg-surface-hover hover:border-border-hover",
  ghost:
    "text-text-secondary hover:text-text-primary hover:bg-surface-hover",
  destructive:
    "text-white bg-destructive-500 hover:bg-destructive-400",
  outline:
    "text-brand-400 border border-brand-700 hover:bg-brand-900/30 hover:border-brand-500",
  cta:
    "text-white font-semibold tracking-wide uppercase",
} as const;

const sizeClasses = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2.5",
  xl: "h-14 px-8 text-base gap-3",
  icon: "h-10 w-10",
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
          "rounded-lg transition-all duration-150 ease-out",
          "focus-ring select-none",
          // Variant
          variantClasses[variant],
          // Size
          sizeClasses[size],
          // Full width
          fullWidth ? "w-full" : "",
          // Disabled
          isDisabled
            ? "opacity-40 cursor-not-allowed pointer-events-none"
            : "cursor-pointer",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={
          variant === "cta"
            ? { backgroundImage: "var(--gradient-cta)" }
            : undefined
        }
        {...props}
      >
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

        {!loading && leftIcon && (
          <span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4">{leftIcon}</span>
        )}

        {size !== "icon" && children && <span>{children}</span>}
        {size === "icon" && children}

        {rightIcon && (
          <span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
