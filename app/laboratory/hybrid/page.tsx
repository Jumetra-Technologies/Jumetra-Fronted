import { DashboardShell } from "@/components/layout/sidebar";
import { HybridLaboratoryClient } from "@/components/laboratory/hybrid/HybridLaboratoryClient";

export default function HybridLaboratoryPage() {
  return (
    <DashboardShell activePath="/laboratory/hybrid">
      <HybridLaboratoryClient />
    </DashboardShell>
  );
}
