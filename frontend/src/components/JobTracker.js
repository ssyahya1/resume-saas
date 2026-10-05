"use client";

import { useEffect, useRef, useState } from "react";
import { isTerminalJobState } from "@/lib/format";
import { useNotifications } from "./NotificationsProvider";
import { Alert, StatusBadge } from "./ui";

export default function JobTracker({
  label,
  job,
  statusEndpoint,
  eventType,
  onComplete,
  onFail,
}) {
  const { events } = useNotifications();
  const [state, setState] = useState(job?.status || "queued");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const finished = useRef(false);

  useEffect(() => {
    if (!job?.jobId || !statusEndpoint) {
      return undefined;
    }

    let active = true;

    const poll = async () => {
      try {
        const data = await statusEndpoint(job.jobId);

        if (!active) {
          return;
        }

        const nextJob = data.job || {};
        setState(nextJob.state || nextJob.status || "processing");

        if (nextJob.state === "completed") {
          if (!finished.current) {
            finished.current = true;
            setResult(nextJob.result || null);
            onComplete?.(nextJob);
          }
          return;
        }

        if (nextJob.state === "failed") {
          if (!finished.current) {
            finished.current = true;
            const message = nextJob.error || "The AI job failed.";
            setError(message);
            onFail?.(message);
          }
        }
      } catch (err) {
        if (active && !finished.current) {
          setError(err.message);
        }
      }
    };

    poll();
    const timer = setInterval(poll, 3000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [job?.jobId, statusEndpoint, onComplete, onFail]);

  useEffect(() => {
    if (!job?.jobId) {
      return;
    }

    const match = events.find(
      (event) => event.jobId === job.jobId && (!eventType || event.type === eventType)
    );

    if (!match) {
      return;
    }

    const syncFromServer = async () => {
      try {
        const data = await statusEndpoint(job.jobId);
        const currentJob = data.job || {};
        const nextState = currentJob.state || currentJob.status || match.status || "processing";
        setState(nextState);

        if (nextState === "completed" && !finished.current) {
          finished.current = true;
          setResult(currentJob.result || null);
          onComplete?.(currentJob);
        }

        if (nextState === "failed" && !finished.current) {
          finished.current = true;
          const message = currentJob.error || match.message || "The AI job failed.";
          setError(message);
          onFail?.(message);
        }
      } catch (err) {
        if (!finished.current) {
          finished.current = true;
          setError(err.message || "Could not retrieve the job status.");
          onFail?.(err.message || "Could not retrieve the job status.");
        }
      }
    };

    syncFromServer();
  }, [events, eventType, job?.jobId, onComplete, onFail, result, state, statusEndpoint]);

  if (!job?.jobId) {
    return null;
  }

  const processing = !isTerminalJobState(state) && !error;

  return (
    <div className="space-y-3 rounded-2xl border border-burgundy-100 bg-burgundy-50/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-burgundy-950">{label}</p>
          <p className="text-xs text-burgundy-800">{processing ? "Preparing your result" : "Your result is ready"}</p>
        </div>
        <StatusBadge status={processing ? state || "processing" : error ? "failed" : "completed"} />
      </div>
      {processing ? (
        <p className="text-sm text-burgundy-900">We’re working on your request. This page will update when it’s ready.</p>
      ) : null}
      {error ? <Alert>{error}</Alert> : null}
      {result ? <Alert tone="success">Result received.</Alert> : null}
    </div>
  );
}
