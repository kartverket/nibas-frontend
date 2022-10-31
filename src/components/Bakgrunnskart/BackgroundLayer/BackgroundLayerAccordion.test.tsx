import { render, screen } from "test/test-utils";
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
        id: "SubLayerName",
      },
    ],
    queryable: true,
    title: "LayerTitle",
    id: "LayerName",
  },
  onVisibilityClick: jest.fn(),
  visible: false,
};

describe("BackgroundLayerAccordion", () => {
  it("should render plus icon if not visible", async () => {
    const { user } = render(<BackgroundLayerAccordion {...defaultProps} />);

    const caret = screen.getByRole("button", {
      name: /layertitle åpne/i,
    });
    await user.click(caret);

    expect(
      screen.getByRole("button", { name: /vis sub layer/i })
    ).toBeInTheDocument();
  });

  it("should render minus icon if visible", async () => {
    const { user } = render(
      <BackgroundLayerAccordion {...defaultProps} visible />
    );

    const caret = screen.getByRole("button", {
      name: /layertitle åpne/i,
    });
    await user.click(caret);

    expect(
      screen.getByRole("button", { name: /vis sub layer/i })
    ).toBeInTheDocument();
  });

  it("should render caret closed with no children initially", () => {
    render(<BackgroundLayerAccordion {...defaultProps} />);

    const caret = screen.getByRole("button", {
      name: /layertitle åpne/i,
    });

    expect(screen.queryByText(/sublayertitle/i)).not.toBeInTheDocument();
    expect(caret).toBeInTheDocument();
  });

  it("should open children on caret click", async () => {
    const { user } = render(<BackgroundLayerAccordion {...defaultProps} />);

    const caret = screen.getByRole("button", {
      name: /layertitle åpne/i,
    });
    await user.click(caret);

    expect(
      screen.getByRole("button", {
        name: /layertitle lukk/i,
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
      name: /no sub layers åpne/i,
    });

    expect(caret).not.toBeInTheDocument();
  });

  it("should render sublayers if aktivt kartlag", () => {
    render(
      <BackgroundLayerAccordion {...defaultProps} isAktiveKartlag={true} />
    );

    const caret = screen.queryByRole("button", {
      name: /fjern sub layers fra aktive kartlag/i,
    });

    expect(caret).not.toBeInTheDocument();
  });
});
