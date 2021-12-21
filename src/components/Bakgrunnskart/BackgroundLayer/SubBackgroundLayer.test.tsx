import { fireEvent, render, screen } from "test/test-utils";
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
        name: "Subsublag1",
      },
      {
        layers: [],
        queryable: true,
        title: "Subsublag2",
        name: "Subsublag2",
      },
    ],
    queryable: true,
    title: "Sublag",
    name: "Sublag",
  },
};

describe("SubBackgroundLayer", () => {
  it("should render sublayers for each sublayer on caret click", () => {
    render(<SubBackgroundLayer {...defaultProps} />);

    const caret = screen.getByRole("button", {
      name: /sublag åpne/i,
    });
    fireEvent.click(caret);

    expect(screen.getByText(/subsublag1/i)).toBeInTheDocument();
    expect(screen.getByText(/subsublag2/i)).toBeInTheDocument();
  });

  it("should open and close eye correctly", () => {
    render(<SubBackgroundLayer {...defaultProps} />);

    const closedEye = screen.getByRole("button", { name: /vis sublag/i });
    fireEvent.click(closedEye);

    const openEye = screen.getByRole("button", { name: /skjul sublag/i });

    expect(openEye).toBeInTheDocument();

    fireEvent.click(openEye);

    expect(closedEye).toBeInTheDocument();
  });

  it("should display name of mapped layer", () => {
    render(<SubBackgroundLayer {...defaultProps} />);

    expect(screen.getByText(/sublag/i)).toBeInTheDocument();
  });
});
