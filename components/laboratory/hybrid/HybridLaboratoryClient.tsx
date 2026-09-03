"use client";

import Link from "next/link";
import { useState } from "react";
import { PhysicalDevicePanel } from "@/components/laboratory/hybrid/PhysicalDevicePanel";
import { PinExplorer } from "@/components/laboratory/hybrid/PinExplorer";
import { HybridConnectionDialog } from "@/components/laboratory/hybrid/HybridConnectionDialog";
import { Badge } from "@/components/ui/badge";
import type { HybridPhysicalDevice, HybridPinConnection } from "@/lib/hybrid-types";

export function HybridLaboratoryClient() {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [connections, setConnections] = useState<HybridPinConnection[]>([]);
  const [activeDevice, setActiveDevice] = useState<HybridPhysicalDevice | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">Hybrid Laboratory</h2>
            <Badge variant="info">Sprint 27</Badge>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Connect real microcontrollers with hhip_agent firmware, explore GPIO pins, and bind
            virtual workspace components for hybrid GPIO events.
          </p>
        </div>
        <Link
          href="/laboratory/workspace"
          className="rounded-[10px] border border-border bg-surface px-4 py-2 text-sm font-medium hover:bg-muted-bg"
        >
          Open Engineering Workspace →
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PhysicalDevicePanel
          selectedDeviceId={selectedDeviceId}
          onSelect={setSelectedDeviceId}
          onConnected={(device) => {
            setActiveDevice(device);
            setSelectedDeviceId(device.device_id);
          }}
        />
        <PinExplorer
          deviceId={selectedDeviceId}
          selectedPinId={selectedPinId}
          onSelectPin={setSelectedPinId}
        />
      </div>

      <HybridConnectionDialog
        deviceId={selectedDeviceId}
        physicalPinId={selectedPinId}
        onCreated={(conn) => setConnections((prev) => [...prev, conn])}
      />

      {activeDevice ? (
        <div className="rounded-[12px] border border-border bg-canvas p-4 text-xs">
          <p className="font-semibold">Active device: {activeDevice.label}</p>
          <p className="mt-1 font-mono text-muted">
            {activeDevice.device_id} · {activeDevice.port} · {activeDevice.firmware_version || "agent"}
          </p>
        </div>
      ) : null}

      {connections.length > 0 ? (
        <div className="rounded-[12px] border border-border bg-surface p-4">
          <h3 className="text-sm font-semibold">Pin connections</h3>
          <ul className="mt-2 space-y-1 text-xs">
            {connections.map((c) => (
              <li key={c.connection_id} className="font-mono text-muted">
                {c.virtual_node_id}.{c.virtual_pin_id} ↔ {c.physical_device_id}.{c.physical_pin_id}
                {c.valid ? "" : " (issues)"}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
