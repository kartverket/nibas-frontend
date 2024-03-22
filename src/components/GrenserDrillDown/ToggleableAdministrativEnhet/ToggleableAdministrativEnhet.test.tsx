import { render, screen } from "test/test-utils";
import ToggleableAdministrativEnhet from "./ToggleableAdministrativEnhet";

const defaultProps: React.ComponentProps<typeof ToggleableAdministrativEnhet> = {
  featuresUrl: "/",

  type: "fylke",
  administrativEnhet: {
    id: {
      lokalid: {
        value: "",
      },
      gyldighetsdato: "",
    },
    navn: [{ navn: "Grense", spraak: "nor", version: 1 }],
    nummer: "1234",
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
    render(<ToggleableAdministrativEnhet {...defaultProps} />);

    expect(screen.getByText("1234 Grense")).toBeInTheDocument();
  });
});
