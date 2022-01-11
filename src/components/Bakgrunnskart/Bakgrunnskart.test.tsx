import { render, screen, fireEvent } from "test/test-utils";
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

  it("should toggle visibility of main layer on eye click", async () => {
    render(<Bakgrunnskart {...defaultProps} />);

    const showLayerButton = await screen.findByRole("button", {
      name: /vis Administrative enheter WMS versjon 2/i,
    });
    fireEvent.click(showLayerButton);

    const hideLayerButton = await screen.findByRole("button", {
      name: /skjul Administrative enheter WMS versjon 2/i,
    });
    fireEvent.click(hideLayerButton);

    expect(showLayerButton).toBeInTheDocument();
  });
});
