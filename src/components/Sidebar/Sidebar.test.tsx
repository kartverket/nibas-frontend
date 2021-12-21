import { render, screen } from "test/test-utils";
import Sidebar from "./Sidebar";
import { defaultTheme } from "style/theme";

const defaultProps: React.ComponentProps<typeof Sidebar> = {
  openPanels: {
    backgroundLayers: false,
    drafts: false,
    nibas: false,
    search: false,
  },
  togglePanel: jest.fn(),
};

describe("Sidebar", () => {
  it("should render four buttons", () => {
    render(<Sidebar {...defaultProps} />);

    const nibasButton = screen.getByRole("button", { name: /nibas/i });
    const sokButton = screen.getByRole("button", { name: /søk/i });
    const bakgrunnskartButton = screen.getByRole("button", {
      name: /bakgrunnskart/i,
    });
    const utkastButton = screen.getByRole("button", { name: /utkast/i });

    expect(nibasButton).toBeInTheDocument();
    expect(sokButton).toBeInTheDocument();
    expect(bakgrunnskartButton).toBeInTheDocument();
    expect(utkastButton).toBeInTheDocument();
  });

  it("should turn button blue when panel is open", () => {
    render(
      <Sidebar
        {...defaultProps}
        openPanels={{
          nibas: true,
          backgroundLayers: false,
          drafts: false,
          search: false,
        }}
      />
    );

    const nibasButton = screen.getByRole("button", { name: /nibas/i });

    expect(nibasButton).toHaveStyle(`color: ${defaultTheme.colors.blue}`);
  });
});
