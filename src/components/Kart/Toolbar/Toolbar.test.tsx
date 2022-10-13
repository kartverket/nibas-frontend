import { render, screen, waitFor } from "test/test-utils";
import { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import Toolbar from "./Toolbar";
import { EditGrenserProvider } from "contexts/EditGrenserContext";
import { MetadataPanelProvider } from "contexts/MetadataPanelContext";
import { ToolbarContext, ToolbarHistory } from "contexts/ToolbarContext";
import { UtkastContext, UtkastProvider } from "contexts/UtkastContext";
import { mockDetailedGrunnkrets1 } from "mocks/handlers/responses";
import { UtkastResponse } from "types/api";

const mockToolbarHistory: ToolbarHistory = {
  index: 1,
  entries: [
    {
      type: "grunnkrets",
      kommuneId: "1",
      changes: [
        {
          from: mockDetailedGrunnkrets1,
          to: {
            ...mockDetailedGrunnkrets1,
            navn: "Ny grunnkrets!",
          },
          id: mockDetailedGrunnkrets1.id,
        },
      ],
    },
  ],
};

const renderWithProvider = (
  ui: ReactNode,
  utkast?: UtkastResponse,
  toolbarHistory: ToolbarHistory = { entries: [], index: 0 }
) =>
  render(
    <BrowserRouter>
      <ToolbarContext.Provider
        value={{ history: toolbarHistory, clearHistory: jest.fn() } as any}
      >
        <EditGrenserProvider>
          <MetadataPanelProvider>
            <UtkastContext.Provider
              value={{ utkast, updateUtkastWithHistory: jest.fn() }}
            >
              {ui}
            </UtkastContext.Provider>
          </MetadataPanelProvider>
        </EditGrenserProvider>
      </ToolbarContext.Provider>
    </BrowserRouter>
  );

const renderWithUtkastProvider = (ui: ReactNode) =>
  render(
    <BrowserRouter>
      <ToolbarContext.Provider
        value={
          {
            history: mockToolbarHistory,
            clearHistory: jest.fn(),
          } as any
        }
      >
        <EditGrenserProvider>
          <MetadataPanelProvider>
            <UtkastProvider>{ui}</UtkastProvider>
          </MetadataPanelProvider>
        </EditGrenserProvider>
      </ToolbarContext.Provider>
    </BrowserRouter>
  );

describe("Toolbar", () => {
  it("should not display toolbar if user cannot save", () => {
    renderWithProvider(<Toolbar />);

    expect(
      screen.queryByRole("button", { name: /lagre som/i })
    ).not.toBeInTheDocument();
  });

  it("should display Lagre som button if no utkast", () => {
    renderWithUtkastProvider(<Toolbar />);

    expect(
      screen.getByRole("button", { name: /lagre som/i })
    ).toBeInTheDocument();
  });

  it("should display Lagre button if utkast exists", () => {
    renderWithProvider(
      <Toolbar />,
      { navn: "Test" } as any,
      mockToolbarHistory
    ); // utkast trenger bare ikke være undefined

    expect(screen.getByRole("button", { name: /lagre/i })).toBeInTheDocument();
  });

  it("should create utkast correctly and change url to apply it", async () => {
    const { user } = renderWithUtkastProvider(<Toolbar />);

    await user.click(screen.getByRole("button", { name: /lagre som/i }));

    await user.type(
      screen.getByRole("textbox", { name: /navn på utkast/i }),
      "Utkast 1"
    );
    await user.selectOptions(
      screen.getByRole("combobox", { name: /type utkast/i }),
      "Retting"
    );

    await user.click(screen.getByRole("button", { name: /lagre som/i }));

    await waitFor(() => expect(window.location.pathname).toContain("/1"));
    // denne skal egentlig bli disabled, men det er via clearHistory() som endrer context state
    expect(
      await screen.findByRole("button", {
        name: "action.Lagre",
      })
    ).toBeInTheDocument();
  });
});
