import { render, screen } from "test/test-utils";
import UtkastItem from "./UtkastItem";
import {
  mockFremtidigEndringConflictResponse,
  mockUtkastRef1,
} from "mocks/handlers/responses";
import { server } from "mocks/server";
import { rest } from "msw";
import { ConflictResponseWrapper } from "types/api";

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
    expect(gyldigFraInput).toHaveValue("2022-06-01");
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
    expect(gyldigFraInput).toHaveValue("2022-06-01");
  });

  it("should open conflict modal on conflict response", async () => {
    server.use(
      rest.post("/v1/utkast/1/publiser", (req, res, ctx) =>
        res.once(
          ctx.status(409),
          ctx.json<ConflictResponseWrapper>({
            httpStatus: "409 CONFLICT",
            optimisticLockExceptions: [],
            framtidigVersjonConflict: mockFremtidigEndringConflictResponse,
          })
        )
      )
    );

    const { user } = render(<UtkastItem {...defaultProps} />);

    await user.click(
      screen.getByRole("button", { name: /publiser Mock utkast/i })
    );
    await user.click(screen.getByRole("button", { name: "action.Publiser" }));

    expect(
      await screen.findByRole("dialog", {
        name: /Konflikt mellom fremtidige endringer/i,
      })
    ).toBeInTheDocument();

    jest.restoreAllMocks();
  });
});
