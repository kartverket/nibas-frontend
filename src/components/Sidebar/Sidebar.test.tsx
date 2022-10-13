import { act, render, screen } from "test/test-utils";
import { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import Sidebar from "./Sidebar";
import { SidebarPanelProvider } from "contexts/SidebarPanelContext";
import { ToolbarProvider } from "contexts/ToolbarContext";
import { UtkastProvider } from "contexts/UtkastContext";
import { defaultTheme } from "style/theme";
import { EditGrenserProvider } from "contexts/EditGrenserContext";
import { MetadataPanelProvider } from "contexts/MetadataPanelContext";

const renderWithProvider = (ui: ReactNode) =>
  render(
    <BrowserRouter>
      <SidebarPanelProvider>
        <ToolbarProvider>
          <EditGrenserProvider>
            <MetadataPanelProvider>
              <UtkastProvider>{ui}</UtkastProvider>
            </MetadataPanelProvider>
          </EditGrenserProvider>
        </ToolbarProvider>
      </SidebarPanelProvider>
    </BrowserRouter>
  );

describe("Sidebar", () => {
  it("should render four buttons", () => {
    renderWithProvider(<Sidebar />);

    const nibasButton = screen.getByRole("button", { name: /inndelinger/i });
    const sokButton = screen.getByRole("button", { name: /søk/i });
    const bakgrunnskartButton = screen.getByRole("button", {
      name: /kartlag/i,
    });
    const utkastButton = screen.getByRole("button", { name: /utkast/i });

    expect(nibasButton).toBeInTheDocument();
    expect(sokButton).toBeInTheDocument();
    expect(bakgrunnskartButton).toBeInTheDocument();
    expect(utkastButton).toBeInTheDocument();
  });

  it("should turn button blue when panel is open", async () => {
    const { user } = renderWithProvider(<Sidebar />);

    const nibasButton = screen.getByRole("button", { name: /inndelinger/i });
    await act(async () => {
      await user.click(nibasButton);
    });

    expect(nibasButton).toHaveStyle(`color: ${defaultTheme.colors.blue}`);
  });
});
