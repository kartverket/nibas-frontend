import { render, screen } from "test/test-utils";
import { ReactNode } from "react";
import GrenserDrillDown from "./GrenserDrillDown";

const renderWithProvider = (ui: ReactNode) =>
  render(ui, {
    SidebarPanelProvider: {
      openPanels: {
        inndelinger: true,
        kartlag: false,
        soek: false,
        utkast: false,
      },
      setPanel: jest.fn(),
      togglePanel: jest.fn(),
    },
  });

describe("GrenserDrillDown", () => {
  it("should not renderWithProvider when not visible", () => {
    renderWithProvider(<GrenserDrillDown />);

    expect(
      screen.queryByRole("heading", { name: /grenser/i })
    ).not.toBeInTheDocument();
  });

  it("should open inndelinger panel on nibas sidebar button click", () => {
    renderWithProvider(<GrenserDrillDown />);

    expect(
      screen.getByRole("heading", { name: /sidebar.inndelinger/i })
    ).toBeInTheDocument();
  });

  it("should render all accordions", () => {
    renderWithProvider(<GrenserDrillDown />);

    expect(screen.getByText(/riksgrenser/i)).toBeInTheDocument();
    expect(screen.getByText(/fylkesgrenser/i)).toBeInTheDocument();
    expect(screen.getByText(/kommunegrenser/i)).toBeInTheDocument();
    expect(screen.getByText(/stemmekretser/i)).toBeInTheDocument();
    expect(screen.getByText(/skolekretser/i)).toBeInTheDocument();
    expect(screen.getByText(/grunnkretser/i)).toBeInTheDocument();
    expect(screen.getByText(/delområder/i)).toBeInTheDocument();
    expect(screen.getByText(/postnummerområder/i)).toBeInTheDocument();
    expect(screen.getByText(/gestlige inndelinger/i)).toBeInTheDocument();
    expect(screen.getByText(/maritime grenser/i)).toBeInTheDocument();
    expect(screen.getByText(/svalbardområdet/i)).toBeInTheDocument();
  });
});
