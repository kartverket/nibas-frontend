import { fireEvent, render, screen } from "test/test-utils";
import GrenserDrillDown from "./GrenserDrillDown";

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

    expect(await screen.findByText(/viken/i)).toBeInTheDocument();
    expect(await screen.findByText(/innlandet/i)).toBeInTheDocument();
  });

  it("should show fylker and kommuner on Kommuner accordion click", async () => {
    render(<GrenserDrillDown visible />);

    const fylkesGrenserAccordionButton = screen.getByRole("button", {
      name: /kommunegrenser/i,
    });
    fireEvent.click(fylkesGrenserAccordionButton);

    const vikenAccordionButton = await screen.findByRole("button", {
      name: /viken/i,
    });
    fireEvent.click(vikenAccordionButton);

    expect(await screen.findByText(/ringerike/i)).toBeInTheDocument();
    expect(await screen.findByText(/hole/i)).toBeInTheDocument();
  });
});
