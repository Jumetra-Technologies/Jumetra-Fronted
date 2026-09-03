import { cn } from "@/lib/utils";

export function Table({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("overflow-x-auto rounded-[12px] border border-border bg-surface shadow-[var(--shadow-sm)]", className)}>
      <table className="w-full text-left text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={cn("bg-canvas px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted", className)}>
      {children}
    </th>
  );
}

export function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("border-t border-border px-4 py-3 text-foreground", className)}>{children}</td>;
}
