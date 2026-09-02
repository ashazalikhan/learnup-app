"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

/* ── Size Map ──────────────────────────────────────────────── */

const sizeClasses = {
  sm: "h-9 px-3 text-xs",
  md: "h-11 px-3.5 text-sm",
  lg: "h-12 px-4 text-base",
} as const;

export type InputSize = keyof typeof sizeClasses;

/* ── Props ─────────────────────────────────────────────────── */

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: InputSize;
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
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
    const inputId =
      id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const hasError = Boolean(error);

    return (
      <div className={`flex flex-col gap-1.5 ${fullWidth ? "w-full" : ""}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-text-secondary"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted [&>svg]:h-4 [&>svg]:w-4 pointer-events-none">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={[
              "w-full font-sans rounded-lg",
              "bg-surface text-text-primary placeholder:text-text-muted",
              "border transition-colors duration-150",
              "focus-ring",
              sizeClasses[size],
              leftIcon ? "pl-10" : "",
              rightIcon ? "pr-10" : "",
              hasError
                ? "border-destructive-500 focus:border-destructive-400"
                : "border-border hover:border-border-hover focus:border-brand-500",
              disabled ? "opacity-40 cursor-not-allowed" : "",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            {...props}
          />

          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted [&>svg]:h-4 [&>svg]:w-4">
              {rightIcon}
            </span>
          )}
        </div>

        {(error || helperText) && (
          <p
            className={`text-xs ${
              hasError ? "text-destructive-400" : "text-text-muted"
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
