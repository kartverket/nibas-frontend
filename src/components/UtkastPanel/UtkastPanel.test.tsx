import { EditGrenserProvider } from "contexts/EditGrenserContext";
import { MetadataPanelProvider } from "contexts/MetadataPanelContext";
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
        <EditGrenserProvider>
          <MetadataPanelProvider>{ui}</MetadataPanelProvider>
        </EditGrenserProvider>
      </SidebarPanelContext.Provider>
    </BrowserRouter>
  );

describe("UtkastPanel", () => {
  it("should render list of utkasts", async () => {
    renderWithProvider(<UtkastPanel />);

    expect(await screen.findAllByRole("listitem")).toHaveLength(2);
  });
});
