import { render, screen, waitForElementToBeRemoved } from "test/test-utils";
import Kommunegrenser from "./Kommunegrenser";

describe("Kommunegrenser", () => {
  it("should show fylker and kommuner on Kommuner accordion click", async () => {
    const { user } = render(<Kommunegrenser />);

    const kommuneGrenserAccordionButton = screen.getByRole("button", {
      name: /åpne inndelinger.kommunegrenser/i,
    });
    await user.click(kommuneGrenserAccordionButton);

    const agderAccordionButton = await screen.findByRole("button", {
      name: /åpne agder/i,
    });
    await user.click(agderAccordionButton);

    expect(await screen.findByText(/malvik/i)).toBeInTheDocument();
    expect(await screen.findByText(/giske/i)).toBeInTheDocument();
  });

  it("should toggle eye on eye click", async () => {
    const { user } = render(<Kommunegrenser />);

    await user.click(
      screen.getByRole("button", { name: /åpne inndelinger\.Kommunegrenser/i })
    );

    await user.click(screen.getByRole("button", { name: /vis agder/i }));

    await waitForElementToBeRemoved(() =>
      screen.getByRole("alert", { name: /henter agder/i })
    );

    await user.click(screen.getByRole("button", { name: /skjul agder/i }));

    expect(
      screen.getByRole("button", { name: /vis agder/i })
    ).toBeInTheDocument();
  });

  /* TODO: Midlertidig skrudd av
  it("should toggle Rediger grenser on click", async () => {
    const { user } = render(<Kommunegrenser />);

    await user.click(
      screen.getByRole("button", { name: /åpne inndelinger\.Kommunegrenser/i })
    );

    await user.click(
      screen.getAllByRole("button", { name: /rediger grenser/i })[0]
    );

    // ??? denne funker over, men ikke her av en eller annen grunn, funker i browser
    // await waitForElementToBeRemoved(() =>
    //   screen.getByRole("alert", { name: /henter inndelinger\.fylkesgrenser/i })
    // );

    await user.click(screen.getByRole("button", { name: /stopp redigering/i }));

    expect(
      screen.queryByRole("button", {
        name: /stopp redigering/i,
      })
    ).not.toBeInTheDocument();
  });
  */
});
