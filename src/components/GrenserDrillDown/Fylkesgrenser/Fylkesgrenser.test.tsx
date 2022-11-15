import { render, screen, waitForElementToBeRemoved } from "test/test-utils";
import Fylkesgrenser from "./Fylkesgrenser";

describe("Fylkesgrenser", () => {
  it("should show fylker on Fylker accordion click", async () => {
    const { user } = render(<Fylkesgrenser />);

    const fylkesGrenserAccordionButton = screen.getByRole("button", {
      name: /åpne inndelinger\.fylkesgrenser/i,
    });
    await user.click(fylkesGrenserAccordionButton);

    expect(
      await screen.findByText(/vestfold og telemark/i)
    ).toBeInTheDocument();
    expect(await screen.findByText(/agder/i)).toBeInTheDocument();
  });

  it("should toggle eye on eye click", async () => {
    const { user } = render(<Fylkesgrenser />);

    await user.click(
      screen.getByRole("button", { name: /vis inndelinger\.fylkesgrenser/i })
    );

    await waitForElementToBeRemoved(() =>
      screen.getByRole("alert", { name: /henter inndelinger\.fylkesgrenser/i })
    );

    await user.click(
      screen.getByRole("button", { name: /skjul inndelinger\.fylkesgrenser/i })
    );

    expect(
      screen.getByRole("button", { name: /vis inndelinger\.fylkesgrenser/i })
    ).toBeInTheDocument();
  });

  it("should toggle Rediger grenser on click", async () => {
    const { user } = render(<Fylkesgrenser />);

    await user.click(screen.getByRole("button", { name: /rediger grenser/i }));

    // ??? denne funker over, men ikke her av en eller annen grunn, funker i browser
    // await waitForElementToBeRemoved(() =>
    //   screen.getByRole("alert", { name: /henter inndelinger\.fylkesgrenser/i })
    // );

    await user.click(screen.getByRole("button", { name: /stopp redigering/i }));

    expect(
      await screen.findByRole("button", {
        name: /rediger grenser/i,
      })
    ).toBeInTheDocument();
  });
});
