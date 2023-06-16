import { render, screen } from "test/test-utils";
import Fylkesgrenser from "./Fylkesgrenser";

describe("Fylkesgrenser", () => {
  it("should show fylker on Fylker accordion click", async () => {
    const { user } = render(<Fylkesgrenser />);

    const fylkesGrenserAccordionButton = screen.getByRole("button", {
      name: "Åpne Fylkesgrenser",
    });
    await user.click(fylkesGrenserAccordionButton);

    expect(await screen.findByText("Vestfold og Telemark")).toBeInTheDocument();
    expect(await screen.findByText("Agder")).toBeInTheDocument();
  });

  it("should toggle eye on eye click", async () => {
    const { user } = render(<Fylkesgrenser />);

    await user.click(screen.getByRole("button", { name: "Vis Fylkesgrenser" }));

    await user.click(
      screen.getByRole("button", { name: "Skjul Fylkesgrenser" })
    );

    expect(
      screen.getByRole("button", { name: "Vis Fylkesgrenser" })
    ).toBeInTheDocument();
  });

  /* TODO: Midlertidig skrudd av
  it("should toggle Rediger grenser on click", async () => {
    const { user } = render(<Fylkesgrenser />);

    await user.click(screen.getByRole("button", { name: "rediger grenser" }));

    // ??? denne funker over, men ikke her av en eller annen grunn, funker i browser
    // await waitForElementToBeRemoved(() =>
    //   screen.getByRole("alert", { name: "henter inndelinger\.fylkesgrenser" })
    // );

    await user.click(screen.getByRole("button", { name: "stopp redigering" }));

    expect(
      await screen.findByRole("button", {
        name: "rediger grenser",
      })
    ).toBeInTheDocument();
  });
  */
});
