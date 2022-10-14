import { render, screen } from "test/test-utils";
import Fylkesgrenser from "./Fylkesgrenser";

describe("Fylkesgrenser", () => {
  it("should show fylker on Fylker accordion click", async () => {
    const { user } = render(<Fylkesgrenser />);

    const fylkesGrenserAccordionButton = screen.getByRole("button", {
      name: /inndelinger.fylkesgrenser/i,
    });
    await user.click(fylkesGrenserAccordionButton);

    expect(
      await screen.findByText(/vestfold og telemark/i)
    ).toBeInTheDocument();
    expect(await screen.findByText(/agder/i)).toBeInTheDocument();
  });
});
