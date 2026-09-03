"use client";

const topics = [
  { name: "Python", slug: "python" },
  { name: "JavaScript", slug: "javascript" },
  { name: "TypeScript", slug: "typescript" },
  { name: "React", slug: "react" },
  { name: "Next.js", slug: "nextdotjs" },
  { name: "Java", slug: "openjdk" },
  { name: "C++", slug: "cplusplus" },
  { name: "Node.js", slug: "nodedotjs" },
  { name: "Git", slug: "git" },
  { name: "HTML5", slug: "html5" },
  { name: "CSS3", slug: "css3" },
  { name: "Tailwind", slug: "tailwindcss" },
  { name: "PostgreSQL", slug: "postgresql" },
];

export function TechTicker() {
  // Duplicate for seamless loop
  const items = [...topics, ...topics];

  return (
    <div className="w-full overflow-hidden border-t border-border bg-background-secondary py-6">
      <div className="flex w-max animate-ticker hover:[animation-play-state:paused]">
        {items.map((topic, i) => (
          <div
            key={`${topic.slug}-${i}`}
            className="flex items-center gap-3 px-6 py-2.5 mx-3 rounded-xl bg-surface border border-border transition-colors duration-150 ease-[var(--ease-out)] @media(hover:hover):hover:bg-surface-hover"
          >
            <img 
              src={`https://cdn.simpleicons.org/${topic.slug}/020617`} 
              alt={`${topic.name} logo`} 
              className="w-4 h-4 dark:invert opacity-70" 
              loading="lazy"
            />
            <span className="font-medium text-text-secondary text-sm">{topic.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
