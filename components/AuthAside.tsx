const points = [
  {
    title: "Ten minutes, then a check",
    body: "One idea per lesson. Write a few lines. See if it runs.",
  },
  {
    title: "No install on the lab PC",
    body: "The editor lives in the browser. Log out when you leave the seat.",
  },
  {
    title: "DSA, not a language dump",
    body: "Arrays first. Then stacks, queues, and the rest of the course.",
  },
];

export function AuthAside() {
  return (
    <div className="hidden lg:block animate-enter delay-100">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-green mb-4">
        Built for lab hours
      </p>
      <h2 className="text-4xl font-extrabold text-foreground leading-[1.15] tracking-tight">
        Finish a lesson
        <br />
        before the bell.
      </h2>
      <ul className="mt-10 space-y-6">
        {points.map((point) => (
          <li key={point.title} className="flex gap-4">
            <span
              className="mt-1 size-3 shrink-0 rounded-full bg-accent-green"
              aria-hidden
            />
            <div>
              <p className="font-bold text-foreground">{point.title}</p>
              <p className="text-sm text-text-secondary mt-1 leading-relaxed">{point.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
