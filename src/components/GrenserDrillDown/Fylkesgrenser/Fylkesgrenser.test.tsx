import { render, screen } from "test/test-utils";
import { ReactNode } from "react";
import userEvent from "@testing-library/user-event";
import Fylkesgrenser from "./Fylkesgrenser";
import { EditGrenserProvider } from "contexts/EditGrenserContext";

const renderWithProvider = (ui: ReactNode) =>
  render(<EditGrenserProvider>{ui}</EditGrenserProvider>);

describe("Fylkesgrenser", () => {
  it("should show fylker on Fylker accordion click", async () => {
    renderWithProvider(<Fylkesgrenser />);

    const fylkesGrenserAccordionButton = screen.getByRole("button", {
      name: /inndelinger.fylkesgrenser/i,
    });
    userEvent.click(fylkesGrenserAccordionButton);

    expect(
      await screen.findByText(/vestfold og telemark/i)
    ).toBeInTheDocument();
    expect(await screen.findByText(/agder/i)).toBeInTheDocument();
  });
});
