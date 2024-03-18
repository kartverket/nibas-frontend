import { render, screen } from "test/test-utils";
import Fylkesgrenser from "./Fylkesgrenser";

describe("Fylkesgrenser", () => {
  it("should show fylker on Fylker accordion click", async () => {
    const { user } = render(<Fylkesgrenser />);

    const fylkesGrenserAccordionButton = screen.getByRole("button", {
      name: "Åpne Fylker",
    });
    await user.click(fylkesGrenserAccordionButton);

    expect(await screen.findByText("38 Vestfold og Telemark")).toBeInTheDocument();
    expect(await screen.findByText("42 Agder")).toBeInTheDocument();
  });
});
