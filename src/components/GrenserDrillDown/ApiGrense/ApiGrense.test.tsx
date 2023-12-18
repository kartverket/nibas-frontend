import { render, screen } from "test/test-utils";
import ApiGrense from "./ApiGrense";

const defaultProps: React.ComponentProps<typeof ApiGrense> = {
  featuresUrl: "/",
  grense: {
    id: {
      gyldighetsdato: "",
      lokalid: { value: "1" },
    },
    navn: [{ navn: "Grense", spraak: "nor", version: 1 }],
    href: "href",
    fylkesnummer: {
      id: "id",
      kodeverdi: "1234",
    },
    antallFramtidigeVersjoner: 0,
  },
  type: "fylke",
};

describe("ApiGrense", () => {
  it("should render name in Norwegian", () => {
    render(<ApiGrense {...defaultProps} />);

    expect(screen.getByText("1234 Grense")).toBeInTheDocument();
  });
});
