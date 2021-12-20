import { render, screen } from "test/test-utils";
import FylkeList from "./FylkeList";

const defaultProps: React.ComponentProps<typeof FylkeList> = {
  canSelect: true,
  fylkeValues: {
    fylke1: {
      editing: false,
      visible: false,
    },
    fylke2: {
      editing: false,
      visible: false,
    },
  },
  fylker: [
    { id: 1, navn: "fylke1", nummer: "1" },
    { id: 2, navn: "fylke2", nummer: "2" },
  ],
  setFylkeValue: jest.fn(),
};

describe("FylkeList", () => {
  it("should render two names from fylker", () => {
    render(<FylkeList {...defaultProps} />);

    expect(screen.getByText("fylke1")).toBeInTheDocument();
    expect(screen.getByText("fylke2")).toBeInTheDocument();
  });
});
