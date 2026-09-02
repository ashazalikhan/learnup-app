import { type HTMLAttributes, type ReactNode } from "react";

/* ── Variant Map ───────────────────────────────────────────── */

const variantClasses = {
  default: "bg-surface border-border",
  filled: "bg-surface-secondary border-border",
  outline: "bg-transparent border-border",
  ghost: "bg-transparent border-transparent",
} as const;

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
} as const;

export type CardVariant = keyof typeof variantClasses;
export type CardPadding = keyof typeof paddingClasses;

/* ── Card Root ─────────────────────────────────────────────── */

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  hoverable?: boolean;
}

function Card({
  variant = "default",
  padding = "md",
  hoverable = false,
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={[
        "rounded-2xl border",
        "transition-colors duration-150",
        variantClasses[variant],
        paddingClasses[padding],
        hoverable
          ? "hover:border-border-hover hover:bg-surface-hover cursor-pointer"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

/* ── Card.Header ───────────────────────────────────────────── */

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  action?: ReactNode;
}

function CardHeader({
  action,
  className = "",
  children,
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={`flex items-start justify-between gap-4 ${className}`}
      {...props}
    >
      <div className="flex-1 min-w-0">{children}</div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* ── Card.Title ────────────────────────────────────────────── */

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

function CardTitle({ className = "", children, ...props }: CardTitleProps) {
  return (
    <h3
      className={`text-lg font-semibold text-text-primary tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

/* ── Card.Description ──────────────────────────────────────── */

interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

function CardDescription({
  className = "",
  children,
  ...props
}: CardDescriptionProps) {
  return (
    <p className={`text-sm text-text-secondary mt-1 ${className}`} {...props}>
      {children}
    </p>
  );
}

/* ── Card.Content ──────────────────────────────────────────── */

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

function CardContent({
  className = "",
  children,
  ...props
}: CardContentProps) {
  return (
    <div className={`mt-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

/* ── Card.Footer ───────────────────────────────────────────── */

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

function CardFooter({
  className = "",
  children,
  ...props
}: CardFooterProps) {
  return (
    <div
      className={`mt-6 flex items-center gap-3 pt-4 border-t border-border ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

/* ── Attach sub-components ─────────────────────────────────── */

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export { Card };
