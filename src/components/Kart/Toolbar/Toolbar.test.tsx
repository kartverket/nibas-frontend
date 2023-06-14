import { render, screen, waitFor } from "test/test-utils";
import { ReactNode } from "react";
import Toolbar from "./Toolbar";
import { HistoryState } from "contexts/HistoryContext";
import { mockDetailedGrunnkrets1 } from "mocks/handlers/responses";
import { UtkastResponse } from "types/api";

const mockHistory: HistoryState = {
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
  hasPreviouslySavedHistory: false,
};

const renderWithProvider = (
  ui: ReactNode,
  utkast?: UtkastResponse,
  history: HistoryState = {
    entries: [],
    index: 0,
    hasPreviouslySavedHistory: false,
  }
) =>
  render(ui, {
    HistoryProvider: {
      history: history,
      clearHistory: vi.fn(),
      activeEditModes: [],
    } as any,
    UtkastProvider: {
      utkast,
      updateUtkastWithHistory: vi.fn(),
      getUpdateUtkastRequestFromHistory: vi.fn(),
      updateUtkast: vi.fn(),
      closeUtkast: vi.fn(),
      isValidating: false,
    },
  });

const renderWithUtkastProvider = (ui: ReactNode) =>
  render(ui, {
    HistoryProvider: {
      history: mockHistory,
      clearHistory: vi.fn(),
      activeEditModes: [],
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
      { navn: "Test", operasjoner: [] } as any,
      mockHistory
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
        name: "Lagre utkast",
      })
    ).toBeInTheDocument();
    expect(await screen.findByText(/Mock utkast/i)).toBeInTheDocument();
  });
});
