import { render, screen } from "test/test-utils";
import Kommunegrenser from "./Kommunegrenser";

describe("Kommunegrenser", () => {
  it("should show fylker and kommun on Kommuner accordion click", async () => {
    const { user } = render(<Kommunegrenser />);

    const kommuneGrenserAccordionButton = screen.getByRole("button", {
      name: "Kommuner expand_more",
    });
    await user.click(kommuneGrenserAccordionButton);

    const agderAccordionButton = await screen.findByRole("button", {
      name: "Åpne 42 Agder",
    });
    await user.click(agderAccordionButton);

    expect(await screen.findByText("5031 Malvik")).toBeInTheDocument();
    expect(await screen.findByText("1532 Giske")).toBeInTheDocument();
  });

  it("should toggle eye on eye click", async () => {
    const { user } = render(<Kommunegrenser />);

    await user.click(
      screen.getByRole("button", {
        name: "Kommuner expand_more",
      }),
    );

    await user.click(screen.getByRole("button", { name: "Vis 42 Agder" }));
    await user.click(screen.getByRole("button", { name: "Skjul 42 Agder" }));

    expect(screen.getByRole("button", { name: "Vis 42 Agder" })).toBeInTheDocument();
  });
});
