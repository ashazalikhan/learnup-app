export function OwlMascot({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 280 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <ellipse cx="140" cy="248" rx="72" ry="10" fill="currentColor" className="text-foreground/10" />
      <path
        d="M86 118c0-48 24-86 54-86s54 38 54 86c18 8 32 32 32 58 0 46-38 78-86 78s-86-32-86-78c0-26 14-50 32-58Z"
        className="fill-accent-green"
      />
      <path
        d="M118 96c0-18-8-32-18-32s-18 14-18 32c0 10 4 18 10 22 8-4 18-12 26-22Z"
        className="fill-accent-green brightness-90"
      />
      <path
        d="M162 96c0-18 8-32 18-32s18 14 18 32c0 10-4 18-10 22-8-4-18-12-26-22Z"
        className="fill-accent-green brightness-90"
      />
      <circle cx="112" cy="132" r="28" className="fill-white dark:fill-slate-50" />
      <circle cx="168" cy="132" r="28" className="fill-white dark:fill-slate-50" />
      <circle cx="118" cy="136" r="12" className="fill-foreground" />
      <circle cx="174" cy="136" r="12" className="fill-foreground" />
      <circle cx="122" cy="132" r="4" className="fill-white" />
      <circle cx="178" cy="132" r="4" className="fill-white" />
      <path d="M140 148 122 168h36L140 148Z" className="fill-energy" />
      <path
        d="M108 188c10 14 22 20 32 20s22-6 32-20"
        stroke="currentColor"
        className="text-white/80"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path d="M92 210c8 16 4 28-8 34" className="stroke-energy" strokeWidth="8" strokeLinecap="round" />
      <path d="M188 210c-8 16-4 28 8 34" className="stroke-energy" strokeWidth="8" strokeLinecap="round" />
    </svg>
  );
}
