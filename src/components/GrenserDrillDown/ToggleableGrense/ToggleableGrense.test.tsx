import { render, screen } from "test/test-utils";
import ToggleableGrense from "./ToggleableGrense";
import { KretsStatus } from "contexts/EditGrenserContext/types";
import { mockBasicFeature } from "mocks/handlers/responses";

const defaultProps: React.ComponentProps<typeof ToggleableGrense> = {
  title: "Grense",
  type: "fylke",
  features: [mockBasicFeature],
  grense: {
    id: {
      lokalid: {
        value: "",
      },
      gyldighetsdato: "",
    },
    administrativenhetnavn: [],
    fylkesnummer: {
      id: "",
      kodeverdi: "",
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

beforeEach(() => {
  vi.clearAllMocks();
});

const renderWithProvider = (ui: React.ReactNode, kretsStatus: KretsStatus = { editing: false, visible: false }) => {
  render(ui, {
    EditGrenserProvider: {
      alleKretserStatuser: { fylke: { "1": kretsStatus } },
      setKretsStatus: vi.fn(),
      setAlleKretserStatuser: vi.fn(),
      resetAndClearAllLayers: vi.fn(),
      getCurrentlyEditingType: vi.fn(),
      setOtherEditingTypes: vi.fn(),
    },
  });
};

describe("ToggleableGrense", () => {
  it("should show eye closed and unchecked checkbox when kretsstatus is undefined", () => {
    renderWithProvider(<ToggleableGrense {...defaultProps} />);

    expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Usynlig" })).toBeInTheDocument();
  });

  it("should show open eye and checked checkbox when kretsstatus values are true", () => {
    renderWithProvider(<ToggleableGrense {...defaultProps} />, {
      editing: true,
      visible: true,
    });

    expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Synlig" })).toBeInTheDocument();
  });
});
