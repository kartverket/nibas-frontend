import { ReactNode } from "react";
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
  moveLayer: vi.fn(),
  toggleLayerVisibility: vi.fn(),
  visible: false,
};

const renderWithProvider = (ui: ReactNode) =>
  render(ui, {
    BakgrunnskartProvider: {
      visibleLayers: { administrativeGrenser: true } as never,
      toggleLayerVisibility: vi.fn(),
      recursiveIsVisible: vi.fn(() => true),
      layerIsVisible: vi.fn(() => true),
      mappedLayers: [
        { ...defaultProps.mappedLayer, sourceId: "administrativeGrenser" },
      ],
      moveLayer: vi.fn(),
      subLayerIsVisible: vi.fn(),
    },
  });

describe("MainBackgroundLayer", () => {
  it("should render sublayers for each sublayer on caret click", async () => {
    const { user } = renderWithProvider(
      <MainBackgroundLayer {...defaultProps} />
    );

    const caret = screen.getByRole("button", {
      name: "Hovedlag Åpne",
    });
    await user.click(caret);

    expect(screen.getByText("Sublag1")).toBeInTheDocument();
    expect(screen.getByText("Sublag2")).toBeInTheDocument();
  });

  it("should display name of mapped layer", () => {
    renderWithProvider(<MainBackgroundLayer {...defaultProps} />);

    expect(screen.getByText("Hovedlag")).toBeInTheDocument();
  });
});
