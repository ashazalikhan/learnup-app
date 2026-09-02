"use client";

const topics = [
  { name: "Python", icon: "🐍" },
  { name: "JavaScript", icon: "📜" },
  { name: "TypeScript", icon: "🔷" },
  { name: "React", icon: "⚛️" },
  { name: "Next.js", icon: "▲" },
  { name: "Java", icon: "☕" },
  { name: "C++", icon: "⚙️" },
  { name: "DSA", icon: "🌳" },
  { name: "SQL", icon: "🗃️" },
  { name: "Git", icon: "📦" },
  { name: "HTML", icon: "🌐" },
  { name: "CSS", icon: "🎨" },
  { name: "Node.js", icon: "💚" },
  { name: "Algorithms", icon: "🧮" },
];

export function TechTicker() {
  // Duplicate for seamless loop
  const items = [...topics, ...topics];

  return (
    <div className="w-full overflow-hidden border-t border-border bg-background-secondary py-4">
      <div className="flex animate-ticker w-max">
        {items.map((topic, i) => (
          <div
            key={`${topic.name}-${i}`}
            className="flex items-center gap-2 px-5 py-2 mx-2 rounded-lg bg-surface border border-border text-sm text-text-secondary whitespace-nowrap"
          >
            <span className="text-base">{topic.icon}</span>
            <span className="font-medium">{topic.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
