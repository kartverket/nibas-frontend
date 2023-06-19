import {
  mockFremtidigEndringConflictResponse,
  mockUtkast,
} from "mocks/handlers/responses";
import { render, screen, waitFor } from "test/test-utils";
import UtkastConflictModal from "../UtkastConflictModal";

const defaultProps: React.ComponentProps<typeof UtkastConflictModal> = {
  conflictResponse: mockFremtidigEndringConflictResponse,
  current: mockUtkast.operasjoner.metadataendringer.grunnkretsendringer["1"],
  utkast: mockUtkast,
  onCancel: vi.fn(),
  onNext: vi.fn(),
};

describe("UtkastConflictModal", () => {
  it("should show 2 rows for headers, 1 row for current item and 2 rows for conflicted items", async () => {
    render(<UtkastConflictModal {...defaultProps} />);

    await waitFor(() => expect(screen.getAllByRole("row")).toHaveLength(5)); // 2 headers + 1 current + 2 future

    expect(screen.getAllByRole("cell", { name: "Retting" })).toHaveLength(3);

    expect(
      screen.getByRole("cell", { name: "Utkast grunnkrets" })
    ).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "12345678" })).toBeInTheDocument();
    expect(
      screen.getByRole("cell", { name: "2022-06-01" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("cell", { name: "Mosekollen vest" })
    ).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "12345679" })).toBeInTheDocument();
    expect(
      screen.getByRole("cell", { name: "2022-04-01" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("cell", { name: "Mosekollen nord" })
    ).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "87654321" })).toBeInTheDocument();
    expect(
      screen.getByRole("cell", { name: "2022-07-01" })
    ).toBeInTheDocument();
  });

  it("should require all rows to be confirmed before submit is enabled", async () => {
    const { user } = render(<UtkastConflictModal {...defaultProps} />);

    await waitFor(
      () => expect(screen.getAllByRole("row")).toHaveLength(5) // 2 headers + 1 current + 2 future
    );

    const publishButton = screen.getByRole("button", {
      name: "Publiser",
    });

    expect(publishButton).toBeDisabled();

    await user.click(
      screen.getByRole("checkbox", { name: "Bekreft grunnkrets 1" })
    );
    expect(publishButton).toBeDisabled();

    await user.click(
      screen.getByRole("checkbox", { name: "Bekreft grunnkrets 2" })
    );
    expect(publishButton).toBeEnabled();
  });
});
