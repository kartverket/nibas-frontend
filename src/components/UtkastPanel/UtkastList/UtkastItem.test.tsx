import { render, screen } from "test/test-utils";
import UtkastItem from "./UtkastItem";
import { mockUtkastRef1 } from "mocks/handlers/responses";

const defaultProps: React.ComponentProps<typeof UtkastItem> = {
  utkast: mockUtkastRef1,
};

describe("UtkastItem", () => {
  it("should set utkast as active on pen click", async () => {
    const { user } = render(<UtkastItem {...defaultProps} />);

    await user.click(
      screen.getByRole("button", { name: /aktiver mock utkast/i })
    );

    const cancelButton = await screen.findByRole("button", {
      name: "action.Avslutt redigering",
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
    const { user } = render(<UtkastItem {...defaultProps} />);

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
