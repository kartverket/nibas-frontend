import { render, screen } from "test/test-utils";
import { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import UtkastItem from "./UtkastItem";
import { EditGrenserProvider } from "contexts/EditGrenserContext";
import { ToolbarProvider } from "contexts/ToolbarContext";
import { UtkastProvider } from "contexts/UtkastContext";
import { mockUtkastRef1 } from "mocks/handlers/responses";
import { MetadataPanelProvider } from "contexts/MetadataPanelContext";

const defaultProps: React.ComponentProps<typeof UtkastItem> = {
  utkast: mockUtkastRef1,
};

const renderWithProvider = (ui: ReactNode) =>
  render(
    <BrowserRouter>
      <ToolbarProvider>
        <EditGrenserProvider>
          <MetadataPanelProvider>
            <UtkastProvider>{ui}</UtkastProvider>
          </MetadataPanelProvider>
        </EditGrenserProvider>
      </ToolbarProvider>
    </BrowserRouter>
  );

describe("UtkastItem", () => {
  it("should set utkast as active on pen click", async () => {
    const { user } = renderWithProvider(<UtkastItem {...defaultProps} />);

    await user.click(
      screen.getByRole("link", { name: /aktiver mock utkast/i })
    );

    const cancelButton = await screen.findByRole("button", {
      name: "action.Avbryt redigering",
    });

    expect(cancelButton).toBeInTheDocument();
    const utkastNameInput = await screen.findByRole("textbox", {
      name: /navn på utkast/i,
    });
    const typeSelect = await screen.findByRole("combobox", {
      name: /type utkast/i,
    });
    const gyldigFraInput = await screen.findByRole("textbox", {
      name: /gyldig fra/i,
    });

    expect(utkastNameInput).toHaveValue("Mock utkast");
    expect(typeSelect).toHaveValue("Retting");
    expect(gyldigFraInput).toHaveValue("2022-12-31");
    expect(document.location.href).toContain(mockUtkastRef1.id);
  });

  it("should open publishing on publish icon button click", async () => {
    const { user } = renderWithProvider(<UtkastItem {...defaultProps} />);

    await user.click(
      screen.getByRole("button", { name: /publiser mock utkast/i })
    );

    const publishButton = await screen.findByRole("button", {
      name: "action.Publiser",
    });

    const gyldigFraInput = await screen.findByRole("textbox", {
      name: /gyldig fra/i,
    });

    expect(publishButton).toBeEnabled();
    expect(gyldigFraInput).toBeDisabled();
    expect(gyldigFraInput).toHaveValue("2022-12-31");
  });
});
