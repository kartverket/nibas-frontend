import { render, screen, waitFor } from "test/test-utils";
import { ReactNode } from "react";
import Toolbar from "./NewToolbar";
import { ToolbarHistory } from "contexts/ToolbarContext";
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
          from: {
            grunnkretsnummer: mockDetailedGrunnkrets1.grunnkretsnummer,
            navn: mockDetailedGrunnkrets1.navn,
            version: mockDetailedGrunnkrets1.version,
            identifikasjon: {
              lokalid: mockDetailedGrunnkrets1.id.lokalid.value,
            },
          },
          to: {
            grunnkretsnummer: mockDetailedGrunnkrets1.grunnkretsnummer,
            version: mockDetailedGrunnkrets1.version,
            identifikasjon: {
              lokalid: mockDetailedGrunnkrets1.id.lokalid.value,
            },
            navn: "Ny grunnkrets!",
          },
          id: mockDetailedGrunnkrets1.id.lokalid.value,
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
  render(ui, {
    ToolbarProvider: {
      history: toolbarHistory,
      clearHistory: jest.fn(),
    } as any,
    UtkastProvider: {
      utkast,
      updateUtkastWithHistory: jest.fn(),
      closeUtkast: jest.fn(),
      isValidating: false,
    },
  });

const renderWithUtkastProvider = (ui: ReactNode) =>
  render(ui, {
    ToolbarProvider: {
      history: mockToolbarHistory,
      clearHistory: jest.fn(),
    } as any,
  });

describe("Toolbar", () => {
  it("should not display toolbar if user cannot save", () => {
    renderWithProvider(<Toolbar />);

    expect(
      screen.queryByRole("button", { name: /lagre som/i })
    ).not.toBeInTheDocument();
  });

  it("should display Lagre som button if no utkast", () => {
    renderWithUtkastProvider(<Toolbar />);

    expect(screen.getByRole("button", { name: /lagre/i })).toBeInTheDocument();
  });

  it("should display Lagre button if utkast exists", () => {
    renderWithProvider(
      <Toolbar />,
      { navn: "Test" } as any,
      mockToolbarHistory
    );

    expect(screen.getByRole("button", { name: /lagre/i })).toBeInTheDocument();
  });

  it("should create utkast correctly and change url to apply it", async () => {
    const { user } = renderWithUtkastProvider(<Toolbar />);

    await user.click(screen.getByRole("button", { name: /lagre/i }));

    await user.type(
      screen.getByRole("textbox", { name: /navn på utkast/i }),
      "Utkast 1"
    );
    await user.selectOptions(
      screen.getByRole("combobox", {
        name: /endringstype/i,
      }),
      "Retting"
    );

    await user.click(screen.getByRole("button", { name: /opprett/i }));

    await waitFor(() => expect(window.location.search).toContain("?utkast=1"));
    // denne skal egentlig bli disabled, men det er via clearHistory() som endrer context state
    expect(
      await screen.findByRole("button", {
        name: "action.Lagre utkast",
      })
    ).toBeInTheDocument();
    expect(await screen.findByText(/Mock utkast/i)).toBeInTheDocument();
  });
});
