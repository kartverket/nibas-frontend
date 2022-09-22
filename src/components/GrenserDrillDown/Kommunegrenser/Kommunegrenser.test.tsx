import { render, screen } from "test/test-utils";
import { ReactNode } from "react";
import Kommunegrenser from "./Kommunegrenser";
import { EditGrenserProvider } from "contexts/EditGrenserContext/EditGrenserContext";
import { UtkastContext } from "contexts/UtkastContext";

const renderWithProvider = (ui: ReactNode) =>
  render(
    <EditGrenserProvider>
      <UtkastContext.Provider value={{ utkast: undefined }}>
        {ui}
      </UtkastContext.Provider>
    </EditGrenserProvider>
  );

describe("Kommunegrenser", () => {
  it("should show fylker and kommuner on Kommuner accordion click", async () => {
    const { user } = renderWithProvider(<Kommunegrenser />);

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
