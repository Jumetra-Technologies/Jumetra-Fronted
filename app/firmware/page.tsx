"use client";

import { DashboardShell } from "@/components/layout/sidebar";
import { FirmwareStudio } from "@/components/firmware/FirmwareStudio";

export default function FirmwarePage() {
  return (
    <DashboardShell activePath="/firmware" fullBleed>
      <FirmwareStudio />
    </DashboardShell>
  );
}
