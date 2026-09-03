import Link from "next/link";
import { DashboardShell } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function HomePage() {
  return (
    <DashboardShell activePath="/">
      <div className="max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">HHIP</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
          Hybrid Hardware Integration Platform
        </h2>
        <p className="mt-3 text-base leading-relaxed text-muted">
          A modern engineering workspace for physical, virtual, and simulated hardware — in one
          product.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/laboratory/workspace">
            <Button size="lg">Open Laboratory ★</Button>
          </Link>
          <Link href="/workspace">
            <Button size="lg" variant="secondary">
              Projects
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="ghost">
              Research Dashboard
            </Button>
          </Link>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            ["Workspace", "Infinite canvas, wires, devices"],
            ["Simulation", "Live sensors, serial, events"],
            ["Hybrid", "Physical + virtual together"],
          ].map(([title, body]) => (
            <Card key={title} className="p-4">
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              <p className="mt-1 text-xs text-muted">{body}</p>
            </Card>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
