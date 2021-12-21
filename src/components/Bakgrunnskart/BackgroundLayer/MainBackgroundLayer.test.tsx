import { fireEvent, render, screen } from "test/test-utils";
import MainBackgroundLayer from "./MainBackgroundLayer";

const defaultProps: React.ComponentProps<typeof MainBackgroundLayer> = {
  index: 0,
  isMainLayerVisible: jest.fn(),
  mainLayerName: "Hovedlag",
  mainLayerSourceId: "administrativeGrenser",
  mappedLayer: {
    layers: [
      {
        layers: [],
        queryable: true,
        title: "Sublag1",
        name: "Sublag1",
      },
      {
        layers: [],
        queryable: true,
        title: "Sublag2",
        name: "Sublag2",
      },
    ],
    queryable: true,
    sourceId: "administrativeGrenser",
    title: "Hovedlag",
    name: "Hovedlag",
  },
  moveLayer: jest.fn(),
  toggleMainLayer: jest.fn(),
};

describe("MainBackgroundLayer", () => {
  it("should render sublayers for each sublayer on caret click", () => {
    render(<MainBackgroundLayer {...defaultProps} />);

    const caret = screen.getByRole("button", {
      name: /åpne hovedlag/i,
    });
    fireEvent.click(caret);

    expect(screen.getByText(/sublag1/i)).toBeInTheDocument();
    expect(screen.getByText(/sublag2/i)).toBeInTheDocument();
  });

  it("should open and close eye correctly", () => {
    render(<MainBackgroundLayer {...defaultProps} />);

    const closedEye = screen.getByRole("button", { name: /vis hovedlag/i });
    fireEvent.click(closedEye);

    const openEye = screen.getByRole("button", { name: /skjul hovedlag/i });

    expect(openEye).toBeInTheDocument();

    fireEvent.click(openEye);

    expect(closedEye).toBeInTheDocument();
  });

  it("should display name of mapped layer", () => {
    render(<MainBackgroundLayer {...defaultProps} />);

    expect(screen.getByText(/hovedlag/i)).toBeInTheDocument();
  });
});
