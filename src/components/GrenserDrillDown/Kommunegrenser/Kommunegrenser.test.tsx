import { render, screen } from "test/test-utils";
import Kommunegrenser from "./Kommunegrenser";

describe("Kommunegrenser", () => {
  it("should show fylker and kommuner on Kommuner accordion click", async () => {
    const { user } = render(<Kommunegrenser />);

    const kommuneGrenserAccordionButton = screen.getByRole("button", {
      name: "Kommuner Åpne Kommuner",
    });
    await user.click(kommuneGrenserAccordionButton);

    const agderAccordionButton = await screen.findByRole("button", {
      name: "Åpne Agder",
    });
    await user.click(agderAccordionButton);

    expect(await screen.findByText("Malvik")).toBeInTheDocument();
    expect(await screen.findByText("Giske")).toBeInTheDocument();
  });

  it("should toggle eye on eye click", async () => {
    const { user } = render(<Kommunegrenser />);

    await user.click(
      screen.getByRole("button", {
        name: "Kommuner Åpne Kommuner",
      })
    );

    await user.click(screen.getByRole("button", { name: "Vis Agder" }));
    await user.click(screen.getByRole("button", { name: "Skjul Agder" }));

    expect(
      screen.getByRole("button", { name: "Vis Agder" })
    ).toBeInTheDocument();
  });
});
