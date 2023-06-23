import { render, screen } from "test/test-utils";
import ToggleableGrense from "./ToggleableGrense";
import { ObjectValue } from "contexts/EditGrenserContext";
import { mockBasicFeature } from "mocks/handlers/responses";

const defaultProps: React.ComponentProps<typeof ToggleableGrense> = {
  grense: {
    id: {
      gyldighetsdato: "",
      lokalid: {
        value: "1",
      },
    },
    href: "",
    navn: [
      {
        navn: "",
        spraak: "",
        version: 1,
      },
    ],
    antallFramtidigeVersjoner: 0,
  },
  title: "Grense",
  type: "fylke",
  features: [mockBasicFeature],
};

beforeEach(() => {
  vi.clearAllMocks();
});

const renderWithProvider = (
  ui: React.ReactNode,
  objectValue: ObjectValue = { editing: false, visible: false }
) => {
  render(ui, {
    EditGrenserProvider: {
      editingObject: { fylke: { "1": objectValue } },
      setObjectValue: vi.fn(),
      setEditingObject: vi.fn(),
      resetAndClearEditingLayer: vi.fn(),
      getCurrentlyEditingType: vi.fn(),
    },
  });
};

describe("ToggleableGrense", () => {
  it("should show eye closed and unchecked checkbox when objectValue is undefined", () => {
    renderWithProvider(<ToggleableGrense {...defaultProps} />);

    expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Usynlig" })).toBeInTheDocument();
  });

  it("should show open eye and checked checkbox when objectValue values are true", () => {
    renderWithProvider(<ToggleableGrense {...defaultProps} />, {
      editing: true,
      visible: true,
    });

    expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Synlig" })).toBeInTheDocument();
  });
});
