import { render, screen } from "test/test-utils";
import Sidebar from "./Sidebar";

describe("Sidebar", () => {
  it("should render four buttons", () => {
    render(<Sidebar />);

    const nibasButton = screen.getByRole("button", {
      name: "space_dashboard sidebar.Inndelinger",
    });
    const bakgrunnskartButton = screen.getByRole("button", {
      name: "map sidebar.Kartlag",
    });
    const utkastButton = screen.getByRole("button", {
      name: "description sidebar.Utkast",
    });

    expect(nibasButton).toBeInTheDocument();
    expect(bakgrunnskartButton).toBeInTheDocument();
    expect(utkastButton).toBeInTheDocument();
  });
});
