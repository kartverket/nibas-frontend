import { render, screen } from "test/test-utils";
import ApiGrense from "./ApiGrense";

const defaultProps: React.ComponentProps<typeof ApiGrense> = {
  featuresUrl: "/",

  type: "fylke",
  grense: {
    id: {
      lokalid: {
        value: "",
      },
      gyldighetsdato: "",
    },
    administrativenhetnavn: [{ navn: "Grense", spraak: "nor", version: 1 }],
    fylkesnummer: {
      id: "id",
      kodeverdi: "1234",
    },
    samiskforvaltningsomraade: false,
    oppdateringsdato: "",
    representasjonspunkt: {
      type: "",
      id: undefined,
      properties: {
        type: "",
        srid: 0,
        metadata: undefined,
        kontekstEgenskaper: [],
        version: 0,
        shouldArchive: false,
      },
      geometry: {
        type: "",
      },
    },
    version: 0,
  },
};

describe("ApiGrense", () => {
  it("should render name in Norwegian", () => {
    render(<ApiGrense {...defaultProps} />);

    expect(screen.getByText("1234 Grense")).toBeInTheDocument();
  });
});
