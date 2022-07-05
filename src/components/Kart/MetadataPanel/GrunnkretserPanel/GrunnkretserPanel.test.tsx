import { render, screen, waitFor } from "test/test-utils";
import GrunnkretserPanel from "./GrunnkretserPanel";
import { mockKommuner } from "mocks/handlers/responses";

const defaultProps: React.ComponentProps<typeof GrunnkretserPanel> = {
  kommune: mockKommuner[0],
};

describe("GrunnkretserPanel", () => {
  it("should render kommunes grunnkretser in table", async () => {
    render(<GrunnkretserPanel {...defaultProps} />);

    expect(await screen.findByRole("table")).toBeInTheDocument();

    await waitFor(() => {
      // 2 grunnkretser + 1 header row
      expect(screen.getAllByRole("row")).toHaveLength(3);
    });
    expect(
      await screen.findByRole("cell", { name: /mosekollen øst/i })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("cell", { name: /12345678/i })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("cell", { name: /dåsvatn/i })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("cell", { name: /12345679/i })
    ).toBeInTheDocument();
  });
});
