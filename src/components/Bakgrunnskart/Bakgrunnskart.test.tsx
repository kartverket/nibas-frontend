import { render, screen } from "test/test-utils";
import Bakgrunnskart from "./Bakgrunnskart";

// mock et layer så vi kan gjøre request og mapping riktig
jest.mock("utils/map/layers", () => ({
  getLayerIdFromMappedLayer: jest.fn(),
  getWMSLayersInMap: () => [
    {
      getSource: () => ({
        getUrls: () => [
          "https://wms.geonorge.no/skwms1/wms.adm_enheter2?service=wms",
        ],
        get: () => "administrativeGrenser",
      }),
    },
  ],
}));

const defaultProps: React.ComponentProps<typeof Bakgrunnskart> = {
  dispatch: jest.fn(),
  layersInZIndexOrder: ["administrativeGrenser"],
  moveLayer: jest.fn(),
  visible: true,
  visibleLayers: {
    administrativeGrenser: true,
  } as never, // vi bryr oss ikke om de andre lagene nå
};

describe("Bakgrunnskart", () => {
  it("should not render when not visible", () => {
    render(<Bakgrunnskart {...defaultProps} visible={false} />);

    expect(
      screen.queryByRole("heading", { name: /bakgrunnskart/i })
    ).not.toBeInTheDocument();
  });

  it("should display layer title from GetCapabilities request", async () => {
    render(<Bakgrunnskart {...defaultProps} />);

    expect(
      await screen.findByText("Administrative enheter WMS versjon 2")
    ).toBeInTheDocument();
  });
});
