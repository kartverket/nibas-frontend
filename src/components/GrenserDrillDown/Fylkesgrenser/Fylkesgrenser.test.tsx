import { render, screen } from "test/test-utils";
import Fylkesgrenser from "./Fylkesgrenser";

describe("Fylkesgrenser", () => {
  it("should show fylker on Fylker accordion click", async () => {
    const { user } = render(<Fylkesgrenser />);

    const fylkesGrenserAccordionButton = screen.getByRole("button", {
      name: "Åpne Fylker",
    });
    await user.click(fylkesGrenserAccordionButton);

    expect(await screen.findByText("Vestfold og Telemark")).toBeInTheDocument();
    expect(await screen.findByText("Agder")).toBeInTheDocument();
  });

  it("should toggle eye on eye click", async () => {
    const { user } = render(<Fylkesgrenser />);

    await user.click(screen.getByRole("button", { name: "Vis Fylker" }));
    await user.click(screen.getByRole("button", { name: "Skjul Fylker" }));

    expect(
      screen.getByRole("button", { name: "Vis Fylker" }),
    ).toBeInTheDocument();
  });
});
