import { render, screen } from "test/test-utils";
import UtkastItem from "./UtkastItem";
import {
  mockFremtidigEndringConflictResponse,
  mockUtkastRef1,
} from "mocks/handlers/responses";
import { server } from "mocks/server";
import { rest } from "msw";
import { ConflictResponseWrapper } from "types/api";
import { waitFor } from "@testing-library/react";

const defaultProps: React.ComponentProps<typeof UtkastItem> = {
  utkast: mockUtkastRef1,
  setUtkastJustPublished: jest.fn(),
};

describe("UtkastItem", () => {
  it("should set utkast as active on pen click", async () => {
    const { user } = render(<UtkastItem {...defaultProps} />);

    await user.click(
      screen.getByRole("button", { name: "Aktiver Mock utkast" })
    );

    const cancelButton = await screen.findByRole("button", {
      name: "Avslutt redigering",
    });
    expect(cancelButton).toBeInTheDocument();

    await waitFor(async () =>
      expect(
        await screen.findByRole("textbox", {
          name: "Navn på utkast",
        })
      ).toHaveDisplayValue("Mock utkast")
    );

    const typeSelect = screen.getByLabelText("Type utkast");

    expect(typeSelect).toHaveValue("Retting");
    expect(document.location.href).toContain(mockUtkastRef1.id);
  });

  it("should open publishing on publish icon button click", async () => {
    const { user } = render(<UtkastItem {...defaultProps} />);

    await user.click(
      screen.getByRole("button", { name: "Publiser Mock utkast" })
    );

    const publishButton = await screen.findByRole("button", {
      name: "Publiser",
    });

    expect(publishButton).toBeEnabled();
  });

  it("should open grunnkretsconflict modal on publish conflict", async () => {
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
      screen.getByRole("button", { name: "Publiser Mock utkast" })
    );
    await user.click(screen.getByRole("button", { name: "Publiser" }));

    expect(
      await screen.findByRole("dialog", {
        name: "Konflikt mellom fremtidige endringer",
      })
    ).toBeInTheDocument();
  });
});
