import { render, screen, waitFor } from "test/test-utils";
import StemmekretserPanel from "./StemmekretserPanel";
import { mockKommuner } from "mocks/handlers/responses";

const defaultProps: React.ComponentProps<typeof StemmekretserPanel> = {
  kommune: mockKommuner[0],
};

describe("StemmekretserPanel", () => {
  it("should render kommunes stemmekretser in table", async () => {
    render(<StemmekretserPanel {...defaultProps} />);

    expect(await screen.findByRole("table")).toBeInTheDocument();

    await waitFor(() => {
      // 2 stemmekretser + 1 header row
      expect(screen.getAllByRole("row")).toHaveLength(3);
    });
    expect(
      await screen.findByRole("cell", { name: /slemfjord/i })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("cell", { name: /12/i })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("cell", { name: /16/i })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("cell", { name: /undredal/i })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("cell", { name: /05/i })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("cell", { name: /14/i })
    ).toBeInTheDocument();
  });
});
