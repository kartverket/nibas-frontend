import { render, screen } from "test/test-utils";
import { ReactNode } from "react";
import userEvent from "@testing-library/user-event";
import Sidebar from "./Sidebar";
import { SidebarPanelProvider } from "contexts/SidebarPanelContext";
import { defaultTheme } from "style/theme";

const renderWithProvider = (ui: ReactNode) =>
  render(<SidebarPanelProvider>{ui}</SidebarPanelProvider>);

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

  it("should turn button blue when panel is open", () => {
    renderWithProvider(<Sidebar />);

    const nibasButton = screen.getByRole("button", { name: /inndelinger/i });
    userEvent.click(nibasButton);

    expect(nibasButton).toHaveStyle(`color: ${defaultTheme.colors.blue}`);
  });
});
