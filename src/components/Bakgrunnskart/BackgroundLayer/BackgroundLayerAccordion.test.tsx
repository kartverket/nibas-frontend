import { fireEvent, render, screen } from "test/test-utils";
import BackgroundLayerAccordion from "./BackgroundLayerAccordion";

const defaultProps: React.ComponentProps<typeof BackgroundLayerAccordion> = {
  children: <p>Child</p>,
  indent: 0,
  mappedLayer: {
    layers: [
      {
        layers: [],
        queryable: true,
        title: "SubLayerTitle",
        name: "SubLayerName",
      },
    ],
    queryable: true,
    title: "LayerTitle",
    name: "LayerName",
  },
  onVisibilityClick: jest.fn(),
  visible: false,
};

describe("BackgroundLayerAccordion", () => {
  it("should render eye closed if not visible", () => {
    render(<BackgroundLayerAccordion {...defaultProps} />);

    expect(
      screen.getByRole("button", { name: /vis layertitle/i })
    ).toBeInTheDocument();
  });

  it("should render eye open if visible", () => {
    render(<BackgroundLayerAccordion {...defaultProps} visible />);

    expect(
      screen.getByRole("button", { name: /skjul layertitle/i })
    ).toBeInTheDocument();
  });

  it("should render caret closed with no children initially", () => {
    render(<BackgroundLayerAccordion {...defaultProps} />);

    const caret = screen.getByRole("button", {
      name: /åpne layertitle sublag/i,
    });

    expect(screen.queryByText(/sublayertitle/i)).not.toBeInTheDocument();
    expect(caret).toBeInTheDocument();
  });

  it("should open children on caret click", () => {
    render(<BackgroundLayerAccordion {...defaultProps} />);

    const caret = screen.getByRole("button", {
      name: /åpne layertitle sublag/i,
    });
    fireEvent.click(caret);

    expect(
      screen.getByRole("button", {
        name: /lukk layertitle sublag/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText(/child/i)).toBeInTheDocument();
  });

  it("should not render caret if no sublayers", () => {
    render(
      <BackgroundLayerAccordion
        {...defaultProps}
        mappedLayer={{ layers: [], queryable: true, title: "No sub layers" }}
      />
    );

    const caret = screen.queryByRole("button", {
      name: /åpne no sub layers sublag/i,
    });

    expect(caret).not.toBeInTheDocument();
  });
});
