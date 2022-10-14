import { render, screen } from "test/test-utils";
import FylkeList from "./FylkeList";

describe("FylkeList", () => {
  it("should render two names from fylker", async () => {
    render(<FylkeList />);

    expect(await screen.findByText("Vestfold og Telemark")).toBeInTheDocument();
    expect(await screen.findByText("Agder")).toBeInTheDocument();
  });

  it("should open eye on eye click", async () => {
    const { user } = render(<FylkeList />);

    const closedEyes = await screen.findAllByRole("button", {
      name: "Usynlig",
    });
    const openEyesBeforeClick = screen.queryAllByRole("button", {
      name: "Synlig",
    });

    await user.click(closedEyes[0]);

    const openEye = screen.getByRole("button", { name: "Synlig" });
    expect(openEye).toBeInTheDocument();
    expect(openEyesBeforeClick).toHaveLength(0);
  });

  it("should open eye and check checkbox on checkbox click", async () => {
    const { user } = render(<FylkeList />);

    const checkbox = await screen.findByRole("checkbox", {
      name: /agder/i,
    });
    await user.click(checkbox);

    expect(checkbox).toBeChecked();
    expect(screen.getByRole("button", { name: "Synlig" })).toBeInTheDocument();
  });

  it("should close both eye and uncheck checkbox when checkbox is checked", async () => {
    const { user } = render(<FylkeList />);

    const checkbox = await screen.findByRole("checkbox", {
      name: /agder/i,
    });
    await user.click(checkbox);
    await user.click(checkbox);

    expect(checkbox).not.toBeChecked();
    expect(
      screen.queryByRole("button", { name: "Synlig" })
    ).not.toBeInTheDocument();
  });
});
