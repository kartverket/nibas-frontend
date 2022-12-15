import { render, screen } from "test/test-utils";
import Sidebar from "./Sidebar";

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
});
