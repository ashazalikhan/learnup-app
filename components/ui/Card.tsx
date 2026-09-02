import { type HTMLAttributes, type ReactNode } from "react";

/* ── Variant Map ───────────────────────────────────────────── */

const variantClasses = {
  default: "bg-surface border-border",
  glass: "glass-card",
  elevated:
    "bg-surface border-border shadow-lg dark:shadow-brand-900/10",
  ghost: "bg-transparent border-transparent",
  gradient: "",
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
  /** Adds hover lift effect */
  hoverable?: boolean;
  /** Adds the brand gradient as border (glow effect) */
  glowBorder?: boolean;
}

function Card({
  variant = "default",
  padding = "md",
  hoverable = false,
  glowBorder = false,
  className = "",
  children,
  ...props
}: CardProps) {
  // Gradient variant uses a wrapper technique for gradient borders
  if (variant === "gradient") {
    return (
      <div
        className={[
          "relative rounded-2xl p-[1px]",
          hoverable
            ? "transition-transform duration-200 hover:-translate-y-1"
            : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ backgroundImage: "var(--gradient-brand)" }}
        {...props}
      >
        <div
          className={[
            "rounded-2xl bg-surface",
            paddingClasses[padding],
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className={[
        "rounded-2xl border",
        "transition-all duration-200 ease-out",
        variantClasses[variant],
        paddingClasses[padding],
        // Hoverable lift
        hoverable
          ? "hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-brand-900/10 cursor-pointer"
          : "",
        // Glow border on hover
        glowBorder
          ? "hover:border-brand-400/40 hover:shadow-[0_0_24px_rgba(99,102,241,0.12)]"
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
  /** Optional action element (button, badge, etc.) aligned to the right */
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
      className={`text-lg font-semibold text-foreground tracking-tight ${className}`}
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
    <p className={`text-sm text-muted mt-1 ${className}`} {...props}>
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
