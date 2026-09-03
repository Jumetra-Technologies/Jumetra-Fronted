import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { HybridPanel } from "@/components/hybrid/hybrid-panel";

vi.mock("@/lib/api-client", () => ({
  api: {
    createHybridExperiment: vi.fn(),
    startHybridExperiment: vi.fn(),
    advanceHybridExperiment: vi.fn(),
  },
}));

describe("HybridPanel", () => {
  it("renders hybrid experiment form", () => {
    render(
      <HybridPanel
        controllers={[{ controller_id: "esp32", name: "ESP32", family: "Espressif" } as never]}
        componentHits={[
          {
            component: {
              component_id: "dht11",
              name: "DHT11",
              category: "sensor",
            },
            score: 1,
            compatible_controllers: ["esp32"],
          } as never,
        ]}
      />,
    );
    expect(screen.getByRole("heading", { name: "Create Hybrid Experiment" })).toBeInTheDocument();
    expect(screen.getByText("Hardware Availability")).toBeInTheDocument();
    expect(screen.getByText("Hybrid Circuit")).toBeInTheDocument();
  });
});

describe("Hybrid API client", () => {
  it("exposes hybrid methods", async () => {
    const { api } = await import("@/lib/api-client");
    expect(typeof api.createHybridExperiment).toBe("function");
    expect(typeof api.startHybridExperiment).toBe("function");
    expect(typeof api.advanceHybridExperiment).toBe("function");
  });
});
