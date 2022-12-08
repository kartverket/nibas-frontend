import { act, render, screen } from "test/test-utils";
import Sidebar from "./Sidebar";
import { defaultTheme } from "style/theme";

describe("Sidebar", () => {
  it("should render four buttons", () => {
    render(<Sidebar />);

    const nibasButton = screen.getByRole("button", { name: /inndelinger/i });
    const bakgrunnskartButton = screen.getByRole("button", {
      name: /kartlag/i,
    });
    const utkastButton = screen.getByRole("button", { name: /utkast/i });

    expect(nibasButton).toBeInTheDocument();
    expect(bakgrunnskartButton).toBeInTheDocument();
    expect(utkastButton).toBeInTheDocument();
  });

  it("should turn button blue when panel is open", async () => {
    const { user } = render(<Sidebar />);

    const nibasButton = screen.getByRole("button", { name: /inndelinger/i });
    await act(async () => {
      await user.click(nibasButton);
    });

    expect(nibasButton).toHaveStyle(`color: ${defaultTheme.colors.blue}`);
  });
});
