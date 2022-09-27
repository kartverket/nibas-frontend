import { render, screen } from "test/test-utils";
import { ReactNode } from "react";
import Fylkesgrenser from "./Fylkesgrenser";
import { EditGrenserProvider } from "contexts/EditGrenserContext";
import { UtkastContext } from "contexts/UtkastContext";

const renderWithProvider = (ui: ReactNode) =>
  render(
    <EditGrenserProvider>
      <UtkastContext.Provider
        value={{ utkast: undefined, updateUtkastWithHistory: jest.fn() }}
      >
        {ui}
      </UtkastContext.Provider>
    </EditGrenserProvider>
  );

describe("Fylkesgrenser", () => {
  it("should show fylker on Fylker accordion click", async () => {
    const { user } = renderWithProvider(<Fylkesgrenser />);

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
