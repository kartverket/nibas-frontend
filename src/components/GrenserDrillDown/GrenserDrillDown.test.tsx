import { fireEvent, render, screen } from "test/test-utils";
import GrenserDrillDown from "./GrenserDrillDown";

jest.mock("utils/map/source", () => ({
  addFeaturesToSource: jest.fn(),
  removeFeaturesFromSource: jest.fn(),
}));
jest.mock("utils/map/layers", () => ({
  getLayerById: () => ({ getSource: jest.fn() }),
}));

describe("GrenserDrillDown", () => {
  it("should not render when not visible", async () => {
    // wrap i act for å vente på async state change
    render(<GrenserDrillDown visible={false} />);
  });

  it("should render all accordions", async () => {
    render(<GrenserDrillDown visible />);

    const riksgrenserAccordion = screen.getByText(/riksgrenser/i);
    const fylkesgrenserAccordion = screen.getByText(/fylkesgrenser/i);
    const kommunegrenserAccordion = screen.getByText(/kommunegrenser/i);
    const kretserAccordion = screen.getByText(/kretser/i);
    const etatOgSektorinndelingAccordion = screen.getByText(
      /etat og sektorinndeling/i
    );
    const loversVirkeAccordion = screen.getByText(/lovers virke/i);
    const svalbardomradetAccordion = screen.getByText(/svalbardområdet/i);
    const maritimeGrenserAccordion = screen.getByText(/maritime grenser/i);

    expect(riksgrenserAccordion).toBeInTheDocument();
    expect(fylkesgrenserAccordion).toBeInTheDocument();
    expect(kommunegrenserAccordion).toBeInTheDocument();
    expect(kretserAccordion).toBeInTheDocument();
    expect(etatOgSektorinndelingAccordion).toBeInTheDocument();
    expect(loversVirkeAccordion).toBeInTheDocument();
    expect(svalbardomradetAccordion).toBeInTheDocument();
    expect(maritimeGrenserAccordion).toBeInTheDocument();
  });

  it("should show fylker on Fylker accordion click", async () => {
    render(<GrenserDrillDown visible />);

    const fylkesGrenserAccordionButton = screen.getByRole("button", {
      name: /fylkesgrenser/i,
    });
    fireEvent.click(fylkesGrenserAccordionButton);

    expect(
      await screen.findByText(/vestfold og telemark/i)
    ).toBeInTheDocument();
    expect(await screen.findByText(/agder/i)).toBeInTheDocument();
  });

  it("should show fylker and kommuner on Kommuner accordion click", async () => {
    render(<GrenserDrillDown visible />);

    const kommuneGrenserAccordionButton = screen.getByRole("button", {
      name: /kommunegrenser/i,
    });
    fireEvent.click(kommuneGrenserAccordionButton);

    const vikenAccordionButton = await screen.findByRole("button", {
      name: /agder/i,
    });
    fireEvent.click(vikenAccordionButton);

    expect(await screen.findByText(/malvik/i)).toBeInTheDocument();
    expect(await screen.findByText(/giske/i)).toBeInTheDocument();
  });

  describe("ToggleableGrense", () => {
    it("should open eye on eye click", async () => {
      render(<GrenserDrillDown visible />);

      const fylkesGrenserAccordionButton = screen.getByRole("button", {
        name: /fylkesgrenser/i,
      });
      fireEvent.click(fylkesGrenserAccordionButton);

      const closedEyes = await screen.findAllByRole("button", {
        name: "Usynlig",
      });
      fireEvent.click(closedEyes[0]);

      const openEye = screen.getByRole("button", { name: "Synlig" });
      expect(openEye).toBeInTheDocument();
    });

    it("should open eye and check checkbox on checkbox click", async () => {
      render(<GrenserDrillDown visible />);

      const fylkesGrenserAccordionButton = screen.getByRole("button", {
        name: /fylkesgrenser/i,
      });
      fireEvent.click(fylkesGrenserAccordionButton);

      const checkbox = await screen.findByRole("checkbox", { name: /agder/i });
      fireEvent.click(checkbox);

      expect(checkbox).toBeChecked();
      expect(
        screen.getByRole("button", { name: "Synlig" })
      ).toBeInTheDocument();
    });

    it("should close both eye and uncheck checkbox when checkbox is checked", async () => {
      render(<GrenserDrillDown visible />);

      const fylkesGrenserAccordionButton = screen.getByRole("button", {
        name: /fylkesgrenser/i,
      });
      fireEvent.click(fylkesGrenserAccordionButton);

      const checkbox = await screen.findByRole("checkbox", { name: /agder/i });
      fireEvent.click(checkbox);
      fireEvent.click(checkbox);

      expect(checkbox).not.toBeChecked();
      expect(
        screen.queryByRole("button", { name: "Synlig" })
      ).not.toBeInTheDocument();
    });
  });
});
