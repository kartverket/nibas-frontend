import { render, screen } from "test/test-utils";
import { ReactNode } from "react";
import GrenserDrillDown from "./GrenserDrillDown";

const renderWithProvider = (ui: ReactNode) =>
  render(ui, {
    SidebarPanelProvider: {
      activeSidebarPanel: "inndelinger",
      openSidebarPanel: vi.fn(),
      closeSidebarPanel: vi.fn(),
    },
  });

describe("GrenserDrillDown", () => {
  it("should not renderWithProvider when not visible", () => {
    renderWithProvider(<GrenserDrillDown />);

    expect(
      screen.queryByRole("heading", { name: "grenser" })
    ).not.toBeInTheDocument();
  });

  it("should open inndelinger panel on nibas sidebar button click", () => {
    renderWithProvider(<GrenserDrillDown />);

    expect(
      screen.getByRole("heading", { name: "Inndelinger" })
    ).toBeInTheDocument();
  });

  it("should render all accordions", () => {
    renderWithProvider(<GrenserDrillDown />);

    expect(screen.getByText("Fylker")).toBeInTheDocument();
    expect(screen.getByText("Kommuner")).toBeInTheDocument();
    expect(screen.getByText("Stemmekretser")).toBeInTheDocument();
    expect(screen.getByText("Grunnkretser")).toBeInTheDocument();
  });
});
