"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { isTerminalJobState, titleCase } from "@/lib/format";
import { useNotifications } from "./NotificationsProvider";
import { Alert, Card, StatusBadge } from "./ui";

function AnalysisList({ title, items }) {
  if (!Array.isArray(items) || !items.length) return null;
  return (
    <section className="rounded-xl border border-warm-200 bg-white p-4">
      <h4 className="text-sm font-semibold text-warm-900">{title}</h4>
      <ul className="mt-3 space-y-2">
        {items.map((item, index) => (
          <li key={`${title}-${index}`} className="flex gap-2 text-sm leading-6 text-warm-700">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-burgundy-600" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function AIJobStatus({ job, statusEndpoint, eventType, toolLabel, onStatusChange }) {
  const { connected, events } = useNotifications();
  const [state, setState] = useState(job?.status || "queued");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [statusError, setStatusError] = useState("");
  const jobId = job?.jobId;

  useEffect(() => {
    if (!jobId) return undefined;
    let active = true;

    const checkStatus = async () => {
      try {
        const response = await statusEndpoint(jobId);
        if (!active) return;
        const currentJob = response.job || {};
        const nextState = currentJob.state || currentJob.status || "processing";
        setState(nextState);
        onStatusChange?.(nextState);
        setResult(currentJob.result || null);
        setStatusError("");
        setError(nextState === "failed"
          ? `We couldn’t complete ${toolLabel.toLowerCase()}. Review your selections and try again.`
          : "");
      } catch {
        if (active) {
          setStatusError("We couldn’t check the latest progress. Your request may still be processing.");
        }
      }
    };

    checkStatus();
    const timer = !connected && !isTerminalJobState(state)
      ? setInterval(checkStatus, 5000)
      : null;

    return () => {
      active = false;
      if (timer) clearInterval(timer);
    };
  }, [connected, jobId, onStatusChange, state, statusEndpoint, toolLabel]);

  useEffect(() => {
    if (!jobId || !connected || isTerminalJobState(state)) return;
    const received = events.some(
      (item) => item.jobId === jobId && item.type === eventType
    );
    if (!received) return;

    let active = true;
    const readStatus = async () => {
      try {
        const response = await statusEndpoint(jobId);
        if (!active) return;
        const currentJob = response.job || {};
        const nextState = currentJob.state || currentJob.status || "processing";
        setState(nextState);
        onStatusChange?.(nextState);
        setResult(currentJob.result || null);
        setStatusError("");
        setError(nextState === "failed"
          ? `We couldn’t complete ${toolLabel.toLowerCase()}. Review your selections and try again.`
          : "");
      } catch {
        if (active) setStatusError("We couldn’t check the latest progress. Your request may still be processing.");
      }
    };
    readStatus();

    return () => {
      active = false;
    };
  }, [connected, eventType, events, jobId, onStatusChange, state, statusEndpoint, toolLabel]);

  if (!jobId) return null;
  const completed = state === "completed";
  const failed = state === "failed";
  const tailoredVersion = result?.version || result;
  const analysis = result?.analysis || result?.result?.analysis || result;
  const analysisSummary = analysis?.summary;
  const matchScore = result?.match_score ?? result?.matchScore ?? analysis?.matchScore;

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-warm-950">{toolLabel}</h2>
          <p className="mt-1 text-sm text-warm-600">
            {completed
              ? "Your result is ready."
              : failed
                ? "This request needs attention."
                : "We’re working on your request. You can stay on this page while it runs."}
          </p>
        </div>
        <StatusBadge status={failed ? "failed" : state} />
      </div>

      {!completed && !failed ? (
        <div className="flex items-center gap-3 rounded-xl bg-burgundy-50 p-4 text-sm text-burgundy-950" role="status">
          <span className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-burgundy-600" />
          {state === "retrying"
            ? "We’re finishing a quick check…"
            : toolLabel === "Resume and job analysis"
              ? "Analyzing your resume and job details…"
              : toolLabel === "Resume tailoring"
                ? "Finding the most relevant experience…"
                : toolLabel === "Cover letter"
                  ? "Drafting your cover letter…"
                  : "Preparing your interview questions…"}
        </div>
      ) : null}

      {failed ? (
        <Alert>{error || "The request failed. Review your selection and try again."}</Alert>
      ) : null}
      {statusError && !failed ? <Alert tone="info">{statusError}</Alert> : null}

      {completed ? (
        <div className="space-y-4">
          {toolLabel === "Resume tailoring" && tailoredVersion?.id ? (
            <div className="rounded-xl border border-burgundy-100 bg-burgundy-50 p-4">
              <p className="text-sm text-burgundy-950">A tailored resume version was added to your resume.</p>
              {tailoredVersion.resume_id ? (
                <Link href={`/dashboard/resumes/${tailoredVersion.resume_id}`} className="mt-2 inline-block text-sm font-semibold text-burgundy-800 underline">
                  View tailored version
                </Link>
              ) : null}
            </div>
          ) : null}
          {toolLabel === "Cover letter" ? (
            <div className="rounded-xl bg-warm-50 p-5">
              <h3 className="mb-2 text-sm font-semibold text-warm-900">Generated cover letter</h3>
              <p className="whitespace-pre-wrap text-sm leading-7 text-warm-700">{result?.content || result?.result?.content || "The cover letter was generated successfully."}</p>
            </div>
          ) : null}
          {toolLabel === "Interview questions" ? (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-warm-900">Interview questions</h3>
              {(Array.isArray(result) ? result : result?.questions || []).map((item, index) => (
                <article key={item.id || `${item.category}-${index}`} className="rounded-xl border border-warm-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-medium text-warm-900">{item.question}</p>
                    {item.category ? <span className="rounded-full bg-warm-100 px-2.5 py-1 text-xs text-warm-600">{titleCase(item.category)}</span> : null}
                  </div>
                  {item.answer_guidance || item.answerGuidance ? (
                    <p className="mt-2 text-sm leading-6 text-warm-600">{item.answer_guidance || item.answerGuidance}</p>
                  ) : null}
                </article>
              ))}
            </div>
          ) : null}
          {toolLabel === "Resume and job analysis" ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-burgundy-100 bg-burgundy-50/70 p-5">
                <h3 className="text-sm font-semibold text-warm-950">Overall assessment</h3>
                {matchScore != null ? (
                  <div className="mt-3 flex items-center gap-4">
                    <span className="text-3xl font-semibold tracking-tight text-burgundy-900">{matchScore}%</span>
                    <div className="min-w-0 flex-1">
                      <div className="h-2 overflow-hidden rounded-full bg-burgundy-100">
                        <div className="h-full rounded-full bg-burgundy-700 transition-[width]" style={{ width: `${Math.min(100, Math.max(0, Number(matchScore)))}%` }} />
                      </div>
                      <p className="mt-1.5 text-xs text-burgundy-900">Resume and job match</p>
                    </div>
                  </div>
                ) : null}
                {analysisSummary ? <p className="mt-3 text-sm leading-6 text-warm-700">{analysisSummary}</p> : null}
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <AnalysisList title="Strengths" items={analysis?.strengths} />
                <AnalysisList title="Skills to consider" items={analysis?.missingSkills} />
              </div>
              <AnalysisList title="Suggestions" items={analysis?.suggestions} />
              {!analysisSummary && !Array.isArray(analysis?.strengths) && !Array.isArray(analysis?.missingSkills) && !Array.isArray(analysis?.suggestions) ? (
                <p className="rounded-xl bg-warm-50 p-4 text-sm text-warm-600">
                  Analysis completed. See your saved analyses from the dashboard.
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
