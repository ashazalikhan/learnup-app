"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { pollFacultySession, type RosterRow } from "@/app/actions/classroom";
import { getLessonByKey } from "@/lib/curriculum/loader";
import { formatTimeInIst } from "@/lib/classroom/time";

export function SessionRoster({
  sessionId,
  questionKeys,
  initialStatus,
  initialTitle,
}: {
  sessionId: string;
  questionKeys: string[];
  initialStatus: string;
  initialTitle: string;
}) {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<RosterRow[]>([]);
  const [denied, setDenied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshedAt, setRefreshedAt] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState(initialStatus);
  const [sessionTitle, setSessionTitle] = useState(initialTitle);
  const inFlight = useRef(false);
  const activeSessionId = useRef(sessionId);
  const requestSeq = useRef(0);

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    const seq = ++requestSeq.current;
    try {
      const result = await pollFacultySession(sessionId);
      if (seq !== requestSeq.current || activeSessionId.current !== sessionId) {
        return;
      }
      if (result.ok) {
        setRows(result.rows);
        setDenied(false);
        setError(null);
        setRefreshedAt(result.refreshedAt);
        setSessionStatus(result.sessionStatus);
        setSessionTitle(result.sessionTitle);
      } else if (result.denied) {
        setDenied(true);
        setRows([]);
        setError(result.error);
      } else {
        setError(result.error);
      }
    } catch {
      if (seq === requestSeq.current && activeSessionId.current === sessionId) {
        setError("Could not load roster.");
      }
    } finally {
      inFlight.current = false;
      if (seq === requestSeq.current) {
        setLoading(false);
      }
    }
  }, [sessionId]);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- poll server action on mount and interval */
    void refresh();
    /* eslint-enable react-hooks/set-state-in-effect */

    const interval = window.setInterval(() => {
      if (document.visibilityState === "hidden") return;
      void refresh();
    }, 8000);

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void refresh();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refresh]);

  if (loading) {
    return <p className="text-sm text-text-muted">Loading roster…</p>;
  }

  if (denied) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-text-muted">
        {sessionTitle} · <span className="font-bold uppercase">{sessionStatus}</span>
      </p>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {refreshedAt ? (
        <p className="text-xs text-text-muted">Last updated {formatTimeInIst(refreshedAt)}</p>
      ) : null}

      <p className="text-xs text-text-muted leading-relaxed">
        Existing lesson progress, including work before this session. Statuses come from
        student-side records and are not tamper-proof.
      </p>

      {rows.length === 0 && !error ? (
        <p className="text-sm text-text-secondary">No students have joined this section yet.</p>
      ) : null}

      {rows.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="text-left py-2 pr-4 font-extrabold">Student</th>
                {questionKeys.map((key) => {
                  const lesson = getLessonByKey(key);
                  return (
                    <th key={key} className="text-left py-2 px-2 font-bold text-xs">
                      {lesson?.title ?? key}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const byKey = new Map(
                  (row.questions ?? []).map((q) => [q.lesson_key, q.status])
                );
                return (
                  <tr key={row.user_id} className="border-b border-border">
                    <td className="py-2 pr-4 font-medium">{row.display_name}</td>
                    {questionKeys.map((key) => (
                      <td key={key} className="py-2 px-2 text-xs capitalize text-text-secondary">
                        {(byKey.get(key) ?? "not_started").replace("_", " ")}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
