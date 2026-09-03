import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ComponentExplorerPro } from "@/components/workspace/DeviceExplorer/ComponentExplorerPro";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useDeviceStore } from "@/stores/device-store";
import { useSimulationStore } from "@/stores/simulation-store";

const searchHits = [
  {
    component: {
      component_id: "dht22",
      name: "DHT22 Temperature Humidity Sensor",
      category: "sensor",
      interfaces: ["digital", "gpio"],
      voltage_v: 3.3,
      description: "",
      manufacturer: "Aosong",
    },
    component_id: "dht22",
    name: "DHT22 Temperature Humidity Sensor",
    category: "sensors",
    catalog_category: "sensor",
    score: 2,
    compatible_controllers: ["esp32", "arduino-uno"],
    pins: [
      { name: "VCC", type: "POWER" },
      { name: "DATA", type: "GPIO" },
      { name: "GND", type: "GROUND" },
    ],
    voltage: { min: 3.3, max: 5 },
    interfaces: ["GPIO", "Digital"],
  },
  {
    component: {
      component_id: "esp32",
      name: "ESP32 DevKit",
      category: "mcu",
      interfaces: ["gpio", "wifi"],
      voltage_v: 3.3,
      description: "",
      manufacturer: "Espressif",
    },
    component_id: "esp32",
    name: "ESP32 DevKit",
    category: "esp32",
    catalog_category: "mcu",
    score: 3,
    compatible_controllers: ["esp32"],
    interfaces: ["GPIO", "WiFi"],
    pins: [],
  },
];

vi.mock("@/lib/api-client", () => ({
  api: {
    searchComponents: vi.fn(async () => searchHits),
    debugComponents: vi.fn(async () => ({
      total_components: 34,
      categories: ["sensor", "mcu"],
      sample_components: [{ id: "dht22", name: "DHT22" }],
    })),
    addWorkspaceNode: vi.fn(async (_id: string, body: { component_id: string }) => ({
      id: "N1",
      component_id: body.component_id,
      label: body.component_id,
      category: "sensors",
      position: { x: 10, y: 10 },
      device_mode: "virtual",
      pin_map: {},
      properties: {},
      live_state: {},
      available: true,
    })),
    getEngineeringWorkspaceState: vi.fn(async () => ({
      canvas: { nodes: [], edges: [] },
    })),
  },
}));

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  useWorkspaceStore.setState({ nodes: [], wires: [], workspaceId: "WS1", name: "Lab" });
  useDeviceStore.setState({ devices: [] });
  useSimulationStore.setState({ status: "connected" } as never);
});

describe("ComponentExplorerPro", () => {
  it("renders search input and results from /components/search", async () => {
    render(<ComponentExplorerPro workspaceId="WS1" />);
    expect(screen.getByTestId("component-search-input")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId("component-card-dht22")).toBeInTheDocument();
    });
  });

  it("filters via search input calling searchComponents", async () => {
    const { api } = await import("@/lib/api-client");
    render(<ComponentExplorerPro workspaceId="WS1" />);
    fireEvent.change(screen.getByTestId("component-search-input"), { target: { value: "temperature" } });
    await waitFor(() => {
      expect(api.searchComponents).toHaveBeenCalled();
    });
  });

  it("supports drag payload for canvas drop", async () => {
    render(<ComponentExplorerPro workspaceId="WS1" />);
    await waitFor(() => screen.getByTestId("component-card-dht22"));
    const card = screen.getByTestId("component-card-dht22");
    const dataTransfer = {
      setData: vi.fn(),
      effectAllowed: "copy",
    };
    fireEvent.dragStart(card, { dataTransfer });
    expect(dataTransfer.setData).toHaveBeenCalledWith("application/hhip-component", "dht22");
  });

  it("shows no matching empty state when API returns empty", async () => {
    const { api } = await import("@/lib/api-client");
    vi.mocked(api.searchComponents).mockResolvedValueOnce([]);
    vi.mocked(api.debugComponents).mockResolvedValueOnce({
      total_components: 34,
      categories: ["sensor"],
      sample_components: [],
    });
    render(<ComponentExplorerPro workspaceId="WS1" />);
    await waitFor(() => {
      expect(screen.getByTestId("empty-no-matching")).toBeInTheDocument();
    });
  });
});
