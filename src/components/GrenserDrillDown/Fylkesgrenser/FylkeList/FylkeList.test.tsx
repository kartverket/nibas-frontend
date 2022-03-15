import { render, screen } from "test/test-utils";
import React from "react";
import FylkeList from "./FylkeList";

const defaultProps: React.ComponentProps<typeof FylkeList> = {
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
  setFylkeValue: jest.fn(),
};

describe("FylkeList", () => {
  it("should render two names from fylker", async () => {
    render(<FylkeList {...defaultProps} />);

    expect(await screen.findByText("Vestfold og Telemark")).toBeInTheDocument();
    expect(await screen.findByText("Agder")).toBeInTheDocument();
  });
});
