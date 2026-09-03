import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-[12px] border border-border bg-surface p-6 shadow-[var(--shadow-sm)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium text-muted">{title}</h3>
      {description ? (
        <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{description}</p>
      ) : null}
    </div>
  );
}
