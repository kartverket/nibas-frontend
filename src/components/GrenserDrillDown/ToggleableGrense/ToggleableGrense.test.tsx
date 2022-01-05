import { render, screen } from "test/test-utils";
import ToggleableGrense from "./ToggleableGrense";

const defaultProps: React.ComponentProps<typeof ToggleableGrense> = {
  canSelect: true,
  getFeaturesToAdd: jest.fn(),
  getFeaturesToRemove: jest.fn(),
  grense: {
    id: 1,
  },
  objectValue: { editing: false, visible: false },
  setObjectValue: jest.fn(),
  title: "Grense",
  type: "fylke",
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("ToggleableGrense", () => {
  it("should show eye closed and unchecked checkbox when objectValue is undefined", () => {
    render(<ToggleableGrense {...defaultProps} objectValue={undefined} />);

    expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Usynlig" })).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: defaultProps.title })
    ).not.toBeChecked();
  });

  it("should show open eye and checked checkbox when objectValue values are true", () => {
    render(
      <ToggleableGrense
        {...defaultProps}
        objectValue={{ editing: true, visible: true }}
      />
    );

    expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Synlig" })).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: defaultProps.title })
    ).toBeChecked();
  });
});
