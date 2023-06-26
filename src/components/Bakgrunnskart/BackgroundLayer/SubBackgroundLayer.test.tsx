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
  render(ui, {
    BakgrunnskartProvider: {
      visibleLayers: { administrativeGrenser: true } as never,
      toggleLayerVisibility: vi.fn(),
      recursiveIsVisible: vi.fn(),
      layerIsVisible: vi.fn(),
      mappedLayers: [
        { ...defaultProps.mappedLayer, sourceId: "administrativeGrenser" },
      ],
      moveLayer: vi.fn(),
      subLayerIsVisible: vi.fn(),
    },
  });

describe("SubBackgroundLayer", () => {
  it("should render sublayers for each open sublayer", async () => {
    const { user } = renderWithProvider(
      <SubBackgroundLayer {...defaultProps} />
    );

    const caret = screen.getByRole("button", {
      name: "Åpne Sublag",
    });

    await user.click(caret);

    expect(screen.getByText("Subsublag1")).toBeInTheDocument();
    expect(screen.getByText("Subsublag2")).toBeInTheDocument();
  });

  it("should display name of mapped layer", () => {
    renderWithProvider(<SubBackgroundLayer {...defaultProps} />);

    expect(screen.getByText("Sublag")).toBeInTheDocument();
  });
});
