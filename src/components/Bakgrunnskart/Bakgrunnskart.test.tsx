import { render, screen } from "test/test-utils";
import Bakgrunnskart from "./Bakgrunnskart";

const mockLayer = {
  getSource: () => ({
    getUrls: () => [
      "https://wms.geonorge.no/skwms1/wms.adm_enheter2?service=wms",
    ],
    get: () => "administrativeGrenser",
  }),
  get: () => "administrativeGrenser",
  setZIndex: jest.fn(),
  setVisible: jest.fn(),
};

// mock et layer så vi kan gjøre request og mapping riktig
jest.mock("utils/map/layers", () => ({
  getLayerIdFromMappedLayer: jest.fn(),
  getWMSLayersInMap: () => [mockLayer],
  getLayerById: () => mockLayer,
}));

const defaultProps: React.ComponentProps<typeof Bakgrunnskart> = {
  visible: true,
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
