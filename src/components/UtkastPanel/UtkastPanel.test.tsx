import { SidebarPanelContext } from "contexts/SidebarPanelContext";
import { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { render, screen } from "test/test-utils";
import UtkastPanel from "./UtkastPanel";

const renderWithProvider = (ui: ReactNode) =>
  render(
    <BrowserRouter>
      <SidebarPanelContext.Provider
        value={{ openPanels: { utkast: true } as any } as any}
      >
        {ui}
      </SidebarPanelContext.Provider>
    </BrowserRouter>
  );

describe("UtkastPanel", () => {
  it("should render list of utkasts", async () => {
    renderWithProvider(<UtkastPanel />);

    expect(await screen.findAllByRole("listitem")).toHaveLength(2);
  });
});
