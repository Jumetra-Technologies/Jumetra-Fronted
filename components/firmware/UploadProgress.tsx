"use client";

export function UploadProgress({
  percent,
  message,
  done,
  failed,
}: {
  percent: number;
  message?: string;
  done?: boolean;
  failed?: boolean;
}) {
  return (
    <div className="rounded border border-border bg-surface p-2 text-[11px]">
      <div className="mb-1 flex justify-between">
        <span className="font-medium">Upload</span>
        <span className="font-mono text-muted">{Math.round(percent)}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded bg-muted-bg">
        <div
          className={`h-full transition-all ${failed ? "bg-red-500" : done ? "bg-emerald-500" : "bg-primary"}`}
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
      {message && <p className="mt-1 text-muted">{message}</p>}
    </div>
  );
}
