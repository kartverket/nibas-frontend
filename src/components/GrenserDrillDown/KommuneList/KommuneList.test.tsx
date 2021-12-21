import { render, screen } from "test/test-utils";
import KommuneList from "./KommuneList";

const defaultProps: React.ComponentProps<typeof KommuneList> = {
  canSelect: true,
  kommuneValues: {
    fylke1: {
      editing: false,
      visible: false,
    },
    fylke2: {
      editing: false,
      visible: false,
    },
  },
  fylke: { id: 2, navn: "fylke2", nummer: "2" },
  setKommuneValue: jest.fn(),
};

describe("KommuneList", () => {
  it("should render two kommuner based on fylke", async () => {
    render(<KommuneList {...defaultProps} />);

    expect(await screen.findByText("Malvik")).toBeInTheDocument();
    expect(await screen.findByText("Giske")).toBeInTheDocument();
  });
});
