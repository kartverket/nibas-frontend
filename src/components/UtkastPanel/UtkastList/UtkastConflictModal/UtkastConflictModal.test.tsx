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
  onCancel: jest.fn(),
  onNext: jest.fn(),
};

describe("UtkastConflictModal", () => {
  it("should show 2 rows for headers, 1 row for current item and 2 rows for conflicted items", async () => {
    render(<UtkastConflictModal {...defaultProps} />);

    await waitFor(() => expect(screen.getAllByRole("row")).toHaveLength(5)); // 2 headers + 1 current + 2 future

    expect(screen.getAllByRole("cell", { name: /retting/i })).toHaveLength(3);

    expect(
      screen.getByRole("cell", { name: /Utkast grunnkrets/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: /12345678/i })).toBeInTheDocument();
    expect(
      screen.getByRole("cell", { name: /2022-06-01/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("cell", { name: /mosekollen vest/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: /12345679/i })).toBeInTheDocument();
    expect(
      screen.getByRole("cell", { name: /2022-04-01/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("cell", { name: /mosekollen nord/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: /87654321/i })).toBeInTheDocument();
    expect(
      screen.getByRole("cell", { name: /2022-07-01/i })
    ).toBeInTheDocument();
  });

  it("should require all rows to be confirmed before submit is enabled", async () => {
    const { user } = render(<UtkastConflictModal {...defaultProps} />);

    await waitFor(
      () => expect(screen.getAllByRole("row")).toHaveLength(5) // 2 headers + 1 current + 2 future
    );

    const publishButton = screen.getByRole("button", { name: /publiser/i });

    expect(publishButton).toBeDisabled();

    await user.click(
      screen.getByRole("checkbox", { name: /bekreft grunnkrets 1/i })
    );
    expect(publishButton).toBeDisabled();

    await user.click(
      screen.getByRole("checkbox", { name: /bekreft grunnkrets 2/i })
    );
    expect(publishButton).toBeEnabled();
  });
});
