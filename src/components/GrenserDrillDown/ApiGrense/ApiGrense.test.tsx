import { render, screen } from "test/test-utils";
import ApiGrense from "./ApiGrense";

const defaultProps: React.ComponentProps<typeof ApiGrense> = {
  featuresUrl: "/",
  grense: {
    id: "1",
    navn: [{ navn: "Grense", spraak: "nor", version: 1 }],
    href: "href",
  },
  type: "fylke",
};

describe("ApiGrense", () => {
  it("should render name in Norwegian", () => {
    render(<ApiGrense {...defaultProps} />);

    expect(screen.getByText(/grense/i)).toBeInTheDocument();
  });
});
