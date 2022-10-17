import { ReactNode } from "react";
import { render, screen } from "test/test-utils";
import SubBackgroundLayer from "./SubBackgroundLayer";

const defaultProps: React.ComponentProps<typeof SubBackgroundLayer> = {
  indent: 0,
  mainLayerName: "Hovedlag",
  mainLayerSourceId: "administrativeGrenser",
  mappedLayer: {
    layers: [
      {
        layers: [],
        queryable: true,
        title: "Subsublag1",
        id: "Subsublag1",
      },
      {
        layers: [],
        queryable: true,
        title: "Subsublag2",
        id: "Subsublag2",
      },
    ],
    queryable: true,
    title: "Sublag",
    id: "Sublag",
  },
};

const renderWithProvider = (ui: ReactNode) =>
  render(ui, { BakgrunnskartProvider: true });

describe("SubBackgroundLayer", () => {
  it("should render sublayers for each sublayer on caret click", async () => {
    const { user } = renderWithProvider(
      <SubBackgroundLayer {...defaultProps} />
    );

    const caret = screen.getByRole("button", {
      name: /sublag åpne/i,
    });
    await user.click(caret);

    expect(screen.getByText(/subsublag1/i)).toBeInTheDocument();
    expect(screen.getByText(/subsublag2/i)).toBeInTheDocument();
  });

  it("should open and close eye correctly", async () => {
    const { user } = renderWithProvider(
      <SubBackgroundLayer {...defaultProps} />
    );

    const closedEye = screen.getByRole("button", { name: /vis sublag/i });
    await user.click(closedEye);

    const openEye = screen.getByRole("button", { name: /skjul sublag/i });

    expect(openEye).toBeInTheDocument();

    await user.click(openEye);

    expect(closedEye).toBeInTheDocument();
  });

  it("should display name of mapped layer", () => {
    renderWithProvider(<SubBackgroundLayer {...defaultProps} />);

    expect(screen.getByText(/sublag/i)).toBeInTheDocument();
  });
});
