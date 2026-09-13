import Link from "next/link";
import { Check } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Path, PathLessonRef } from "@/lib/curriculum/types";
import { cn } from "@/lib/utils";

export type NodeState = "locked" | "current" | "completed";

interface PathMapProps {
  path: Path;
  nodeStates: NodeState[];
  completedCount: number;
  resumeHref: string;
  resumeLabel: string;
  pathComplete?: boolean;
}

function PathNode({
  lesson,
  state,
  index,
  side,
}: {
  lesson: PathLessonRef;
  state: NodeState;
  index: number;
  side: "left" | "right" | "center";
}) {
  const href = `/learn/arrays/${lesson.slug}`;
  const isPlayable = state !== "locked";

  const nodeClasses = cn(
    "relative flex h-14 w-14 items-center justify-center rounded-2xl border-2 font-extrabold text-sm transition-transform duration-[120ms] [transition-timing-function:var(--ease-out)]",
    state === "completed" &&
      "border-accent-green bg-accent-green/15 text-accent-green",
    state === "current" &&
      "border-energy bg-energy/10 text-energy ring-4 ring-energy/25",
    state === "locked" &&
      "border-border bg-surface-secondary text-text-muted cursor-not-allowed"
  );

  const inner = (
    <>
      {state === "completed" ? (
        <Check className="h-6 w-6" strokeWidth={3} />
      ) : (
        <span className="tabular-nums">{index + 1}</span>
      )}
    </>
  );

  const alignment =
    side === "left"
      ? "self-start ml-4 md:ml-12"
      : side === "right"
        ? "self-end mr-4 md:mr-12"
        : "self-center";

  return (
    <div className={cn("flex flex-col items-center gap-2 w-full", alignment)}>
      {isPlayable ? (
        <Link
          href={href}
          className={cn(nodeClasses, "active:scale-[0.97] hover:opacity-90")}
          aria-label={`${lesson.title}${state === "completed" ? " — completed" : ""}`}
        >
          {inner}
        </Link>
      ) : (
        <div className={nodeClasses} aria-label={`${lesson.title} — locked`}>
          {inner}
        </div>
      )}
      <p
        className={cn(
          "text-[11px] font-bold max-w-[120px] text-center leading-tight",
          state === "locked" ? "text-text-muted" : "text-foreground"
        )}
      >
        {lesson.title}
      </p>
    </div>
  );
}

export function PathMap({
  path,
  nodeStates,
  completedCount,
  resumeHref,
  resumeLabel,
  pathComplete = false,
}: PathMapProps) {
  const total = path.lessons.length;
  const progressPct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const clusterLabels = new Map<string, string>();
  for (const cluster of path.clusters) {
    clusterLabels.set(cluster.id, cluster.label);
  }

  const showClusterAt = path.lessons.map((lesson, index) => {
    if (index === 0) return true;
    return lesson.cluster !== path.lessons[index - 1].cluster;
  });

  return (
    <div className="flex flex-col min-h-[420px] rounded-2xl bg-card border-2 border-border p-8 md:p-10 shadow-[0_4px_0_var(--border)]">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-green mb-2">
        {path.unitLabel}
      </p>
      <h2 className="text-3xl font-extrabold text-foreground mb-2 tracking-tight">
        {path.title}
      </h2>
      <p className="text-text-secondary max-w-md mb-6 leading-relaxed text-sm">
        {path.description}
      </p>

      <Progress value={progressPct} className="mb-8 max-w-sm">
        <span className="text-xs font-bold text-text-muted">
          {completedCount} / {total} lessons
        </span>
      </Progress>

      {pathComplete ? (
        <div className="mb-6 rounded-xl border-2 border-accent-green/40 bg-accent-green/10 px-4 py-3 text-sm font-bold text-accent-green">
          Path complete — every lesson passed. Replay any node to practice.
        </div>
      ) : null}

      <div className="flex-1 flex flex-col gap-1 mb-8">
        {path.lessons.map((lesson, index) => {
          const showCluster = showClusterAt[index];

          const side: "left" | "right" | "center" =
            index % 3 === 0 ? "left" : index % 3 === 1 ? "right" : "center";

          return (
            <div key={lesson.slug} className="flex flex-col">
              {showCluster ? (
                <p
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted mb-3 mt-2",
                    side === "left" && "text-left ml-4 md:ml-12",
                    side === "right" && "text-right mr-4 md:mr-12",
                    side === "center" && "text-center"
                  )}
                >
                  {clusterLabels.get(lesson.cluster) ?? lesson.cluster}
                </p>
              ) : null}
              <PathNode
                lesson={lesson}
                state={nodeStates[index]}
                index={index}
                side={side}
              />
              {index < path.lessons.length - 1 ? (
                <div
                  className={cn(
                    "h-8 w-0.5 bg-border mx-auto",
                    side === "left" && "ml-[calc(1rem+1.75rem)] md:ml-[calc(3rem+1.75rem)]",
                    side === "right" && "mr-[calc(1rem+1.75rem)] md:mr-[calc(3rem+1.75rem)]"
                  )}
                  aria-hidden
                />
              ) : null}
            </div>
          );
        })}
      </div>

      <Link
        href={resumeHref}
        className={cn(buttonVariants({ variant: "cta", size: "lg" }), "w-fit px-8 h-12")}
      >
        {resumeLabel}
      </Link>
    </div>
  );
}
