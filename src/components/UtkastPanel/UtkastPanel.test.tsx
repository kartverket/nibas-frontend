import { ReactNode } from "react";
import { render, screen } from "test/test-utils";
import UtkastPanel from "./UtkastPanel";

const renderWithProvider = (ui: ReactNode) =>
  render(ui, {
    SidebarPanelProvider: {
      activeSidebarPanel: "utkast",
      openSidebarPanel: vi.fn(),
      closeSidebarPanel: vi.fn(),
    },
  });

describe("UtkastPanel", () => {
  it("should render list of utkasts", async () => {
    renderWithProvider(<UtkastPanel />);

    expect(await screen.findAllByRole("listitem")).toHaveLength(2);
  });
});
