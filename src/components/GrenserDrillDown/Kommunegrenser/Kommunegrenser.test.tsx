import { render, screen } from "test/test-utils";
import Kommunegrenser from "./Kommunegrenser";

describe("Kommunegrenser", () => {
  it("should show fylker and kommuner on Kommuner accordion click", async () => {
    const { user } = render(<Kommunegrenser />);

    const kommuneGrenserAccordionButton = screen.getByRole("button", {
      name: /inndelinger.kommunegrenser/i,
    });
    await user.click(kommuneGrenserAccordionButton);

    const agderAccordionButton = await screen.findByRole("button", {
      name: /agder/i,
    });
    await user.click(agderAccordionButton);

    expect(await screen.findByText(/malvik/i)).toBeInTheDocument();
    expect(await screen.findByText(/giske/i)).toBeInTheDocument();
  });
});
