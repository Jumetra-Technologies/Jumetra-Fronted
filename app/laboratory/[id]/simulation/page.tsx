import { DashboardShell } from "@/components/layout/sidebar";
import { SimulationPanel } from "@/components/laboratory/simulation-panel";
import { api } from "@/lib/api-client";

export default async function SimulationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let lab = null;
  try {
    lab = await api.getLaboratory(id);
  } catch {
    lab = null;
  }

  return (
    <DashboardShell activePath="/laboratory">
      <SimulationPanel laboratoryId={id} initialLab={lab} />
    </DashboardShell>
  );
}
