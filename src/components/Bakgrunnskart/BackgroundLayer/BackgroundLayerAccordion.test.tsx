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
  onVisibilityClick: vi.fn(),
  visible: false,
};

describe("BackgroundLayerAccordion", () => {
  it("should render plus icon if not visible", async () => {
    render(
      <BackgroundLayerAccordion
        {...defaultProps}
        mappedLayer={{ layers: [], queryable: true, title: "No sub layers" }}
      />
    );

    expect(
      screen.getByRole("button", { name: "Vis No sub layers" })
    ).toBeInTheDocument();
  });

  it("should render minus icon if visible", async () => {
    render(
      <BackgroundLayerAccordion
        {...defaultProps}
        visible
        mappedLayer={{ layers: [], queryable: true, title: "No sub layers" }}
      />
    );

    expect(
      screen.getByRole("button", { name: "Fjern No sub layers" })
    ).toBeInTheDocument();
  });

  it("should render caret closed with no children initially", () => {
    render(<BackgroundLayerAccordion {...defaultProps} />);

    const caret = screen.getByRole("button", {
      name: "Åpne LayerTitle",
    });

    expect(screen.queryByText("sublayertitle")).not.toBeInTheDocument();
    expect(caret).toBeInTheDocument();
  });

  it("should open children on caret click", async () => {
    const { user } = render(<BackgroundLayerAccordion {...defaultProps} />);

    const caret = screen.getByRole("button", {
      name: "Åpne LayerTitle",
    });

    await user.click(caret);

    expect(
      screen.getByRole("button", {
        name: "Lukk LayerTitle",
      })
    ).toBeInTheDocument();
    expect(screen.getByText("Child")).toBeInTheDocument();
  });

  it("should not render caret if no sublayers", () => {
    render(
      <BackgroundLayerAccordion
        {...defaultProps}
        mappedLayer={{ layers: [], queryable: true, title: "No sub layers" }}
      />
    );

    const caret = screen.queryByRole("button", {
      name: "no sub layers åpne",
    });

    expect(caret).not.toBeInTheDocument();
  });

  it("should render sublayers if aktivt kartlag", () => {
    render(<BackgroundLayerAccordion {...defaultProps} isAktiveKartlag />);

    const caret = screen.queryByRole("button", {
      name: "fjern SubLayerTitle fra aktive kartlag",
    });

    expect(caret).not.toBeInTheDocument();
  });
});
