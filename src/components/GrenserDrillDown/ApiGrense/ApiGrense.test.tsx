import { render, screen } from "test/test-utils";
import ApiGrense from "./ApiGrense";

const defaultProps: React.ComponentProps<typeof ApiGrense> = {
  featuresUrl: "/",
  grense: {
    id: {
      gyldigFra: "",
      lokalid: { value: "1" },
    },
    navn: [{ navn: "Grense", spraak: "nor", version: 1 }],
    href: "href",
    antallFramtidigeVersjoner: 0,
  },
  type: "fylke",
};

describe("ApiGrense", () => {
  it("should render name in Norwegian", () => {
    render(<ApiGrense {...defaultProps} />);

    expect(screen.getByText(/grense/i)).toBeInTheDocument();
  });
});
