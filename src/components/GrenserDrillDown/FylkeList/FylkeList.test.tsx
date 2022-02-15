import { render, screen } from "test/test-utils";
import FylkeList from "./FylkeList";
import React from "react";

const defaultProps: React.ComponentProps<typeof FylkeList> = {
  // canSelect: true,
  fylkeValues: {
    "Vestfold og Telemark": {
      editing: false,
      visible: false,
    },
    Agder: {
      editing: false,
      visible: false,
    },
  },
  fylker: [
    {
      // type: "FYLKE",
      id: "1",
      navn: [{ navn: "Vestfold og Telemark", spraak: "nor" }],
      href: "href1",
    },
    {
      // type: "FYLKE",
      id: "2",
      navn: [{ navn: "Agder", spraak: "nor" }],
      href: "href2",
    },
  ],
  setFylkeValue: jest.fn(),
};

describe("FylkeList", () => {
  it("should render two names from fylker", () => {
    render(<FylkeList {...defaultProps} />);

    expect(screen.getByText("Vestfold og Telemark")).toBeInTheDocument();
    expect(screen.getByText("Agder")).toBeInTheDocument();
  });
});
