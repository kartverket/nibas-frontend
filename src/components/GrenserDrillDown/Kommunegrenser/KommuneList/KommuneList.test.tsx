import { render, screen } from "test/test-utils";
import KommuneList from "./KommuneList";

const defaultProps: React.ComponentProps<typeof KommuneList> = {
  canSelect: true,
  kommuneValues: {},
  fylke: { id: 2, navn: [{ navn: "Fylke", spraak: "nor" }], type: "FYLKE" },
  setKommuneValue: jest.fn(),
};

describe("KommuneList", () => {
  it("should render two kommuner from API request", async () => {
    render(<KommuneList {...defaultProps} />);

    expect(await screen.findByText("Malvik")).toBeInTheDocument();
    expect(await screen.findByText("Giske")).toBeInTheDocument();
  });
});
