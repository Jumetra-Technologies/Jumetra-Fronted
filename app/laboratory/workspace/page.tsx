import { DashboardShell } from "@/components/layout/sidebar";
import { EngineeringWorkspaceShell } from "@/components/workspace/EngineeringWorkspaceShell";

export default function LaboratoryWorkspacePage() {
  return (
    <DashboardShell activePath="/laboratory/workspace" fullBleed>
      <EngineeringWorkspaceShell />
    </DashboardShell>
  );
}
