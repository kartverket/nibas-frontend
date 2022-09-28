import { render, screen } from "test/test-utils";
import MainBackgroundLayer from "./MainBackgroundLayer";

const defaultProps: React.ComponentProps<typeof MainBackgroundLayer> = {
  index: 0,
  mappedLayer: {
    layers: [
      {
        layers: [],
        queryable: true,
        title: "Sublag1",
        id: "Sublag1",
      },
      {
        layers: [],
        queryable: true,
        title: "Sublag2",
        id: "Sublag2",
      },
    ],
    queryable: true,
    sourceId: "administrativeGrenser",
    title: "Hovedlag",
    id: "Hovedlag",
  },
  moveLayer: jest.fn(),
  toggleLayerVisibility: jest.fn(),
  visible: false,
};

describe("MainBackgroundLayer", () => {
  it("should render sublayers for each sublayer on caret click", async () => {
    const { user } = render(<MainBackgroundLayer {...defaultProps} />);

    const caret = screen.getByRole("button", {
      name: /hovedlag åpne/i,
    });
    await user.click(caret);

    expect(screen.getByText(/sublag1/i)).toBeInTheDocument();
    expect(screen.getByText(/sublag2/i)).toBeInTheDocument();
  });

  it("should display name of mapped layer", () => {
    render(<MainBackgroundLayer {...defaultProps} />);

    expect(screen.getByText(/hovedlag/i)).toBeInTheDocument();
  });
});
