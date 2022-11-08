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
});
