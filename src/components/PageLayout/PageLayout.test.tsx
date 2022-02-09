import { fireEvent, render, screen } from "test/test-utils";
import PageLayout from "./PageLayout";

describe("PageLayout", () => {
  describe("Sidebar", () => {
    it("should close panel on same sidebar button click", () => {
      render(<PageLayout />);

      const bakgrunnskartButton = screen.getByRole("button", {
        name: /bakgrunnskart/i,
      });
      fireEvent.click(bakgrunnskartButton);
      fireEvent.click(bakgrunnskartButton);

      expect(
        screen.queryByRole("heading", { name: /bakgrunnskart/i })
      ).not.toBeInTheDocument();
    });

    it("should close other panels if another sidebar panel is opened", () => {
      render(<PageLayout />);

      const bakgrunnskartButton = screen.getByRole("button", {
        name: /bakgrunnskart/i,
      });
      fireEvent.click(bakgrunnskartButton);

      const nibasButton = screen.getByRole("button", { name: /nibas/i });
      fireEvent.click(nibasButton);

      expect(
        screen.getByRole("heading", { name: /grenser/i })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: /bakgrunnskart/i })
      ).not.toBeInTheDocument();
    });

    it("should close panel on left caret button click", () => {
      render(<PageLayout />);

      const bakgrunnskartButton = screen.getByRole("button", {
        name: /bakgrunnskart/i,
      });
      fireEvent.click(bakgrunnskartButton);

      const closeButton = screen.getByRole("button", {
        name: /lukk bakgrunnskart/i,
      });
      fireEvent.click(closeButton);

      expect(
        screen.queryByRole("heading", { name: /bakgrunnskart/i })
      ).not.toBeInTheDocument();
    });
  });

  describe("Background layers panel", () => {
    it("should not render when not visible", () => {
      render(<PageLayout />);

      expect(
        screen.queryByRole("heading", { name: /bakgrunnskart/i })
      ).not.toBeInTheDocument();
    });

    it("should open bakgrunnskart panel on bakgrunsskart button click", async () => {
      render(<PageLayout />);

      const bakgrunnskartButton = screen.getByRole("button", {
        name: /bakgrunnskart/i,
      });
      fireEvent.click(bakgrunnskartButton);

      expect(
        screen.getByRole("heading", { name: /bakgrunnskart/i })
      ).toBeInTheDocument();
      expect(
        await screen.findByText("Administrative enheter WMS versjon 2")
      ).toBeInTheDocument();
    });

    it("should toggle visibility of WMS layer on eye click", async () => {
      render(<PageLayout />);

      const bakgrunnskartButton = screen.getByRole("button", {
        name: /bakgrunnskart/i,
      });
      fireEvent.click(bakgrunnskartButton);

      const showLayerButton = await screen.findByRole("button", {
        name: /vis Administrative enheter WMS versjon 2/i,
      });
      fireEvent.click(showLayerButton);

      const hideLayerButton = await screen.findByRole("button", {
        name: /skjul Administrative enheter WMS versjon 2/i,
      });
      fireEvent.click(hideLayerButton);

      expect(showLayerButton).toBeInTheDocument();
    });

    it("should toggle visibility of WMTS layer on eye click", async () => {
      render(<PageLayout />);

      const bakgrunnskartButton = screen.getByRole("button", {
        name: /bakgrunnskart/i,
      });
      fireEvent.click(bakgrunnskartButton);

      const showLayerButton = await screen.findByRole("button", {
        name: /vis Nibcache_UTM33_EUREF89_v2/i,
      });
      fireEvent.click(showLayerButton);

      const hideLayerButton = await screen.findByRole("button", {
        name: /skjul Nibcache_UTM33_EUREF89_v2/i,
      });
      fireEvent.click(hideLayerButton);

      expect(showLayerButton).toBeInTheDocument();
    });
  });

  describe("Nibas panel", () => {
    it("should not render when not visible", async () => {
      render(<PageLayout />);

      expect(
        screen.queryByRole("heading", { name: /grenser/i })
      ).not.toBeInTheDocument();
    });

    it("should open nibas panel on nibas sidebar button click", () => {
      render(<PageLayout />);

      const nibasButton = screen.getByRole("button", { name: /nibas/i });
      fireEvent.click(nibasButton);

      expect(
        screen.getByRole("heading", { name: /grenser/i })
      ).toBeInTheDocument();
    });

    it("should render all accordions", async () => {
      render(<PageLayout />);

      const nibasButton = screen.getByRole("button", { name: /nibas/i });
      fireEvent.click(nibasButton);

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
      render(<PageLayout />);

      const nibasButton = screen.getByRole("button", { name: /nibas/i });
      fireEvent.click(nibasButton);

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
      render(<PageLayout />);

      const nibasButton = screen.getByRole("button", { name: /nibas/i });
      fireEvent.click(nibasButton);

      const kommuneGrenserAccordionButton = screen.getByRole("button", {
        name: /kommunegrenser/i,
      });
      fireEvent.click(kommuneGrenserAccordionButton);

      const agderAccordionButton = await screen.findByRole("button", {
        name: /agder/i,
      });
      fireEvent.click(agderAccordionButton);

      expect(await screen.findByText(/malvik/i)).toBeInTheDocument();
      expect(await screen.findByText(/giske/i)).toBeInTheDocument();
    });

    describe("ToggleableGrense", () => {
      it("should open eye on eye click", async () => {
        render(<PageLayout />);

        const nibasButton = screen.getByRole("button", { name: /nibas/i });
        fireEvent.click(nibasButton);

        const fylkesGrenserAccordionButton = screen.getByRole("button", {
          name: /fylkesgrenser/i,
        });
        fireEvent.click(fylkesGrenserAccordionButton);

        const closedEyes = await screen.findAllByRole("button", {
          name: "Usynlig",
        });
        const openEyesBeforeClick = screen.queryAllByRole("button", {
          name: "Synlig",
        });

        fireEvent.click(closedEyes[0]);

        const openEye = screen.getByRole("button", { name: "Synlig" });
        expect(openEye).toBeInTheDocument();
        expect(openEyesBeforeClick).toHaveLength(0);
      });

      it("should open eye and check checkbox on checkbox click", async () => {
        render(<PageLayout />);

        const nibasButton = screen.getByRole("button", { name: /nibas/i });
        fireEvent.click(nibasButton);

        const fylkesGrenserAccordionButton = screen.getByRole("button", {
          name: /fylkesgrenser/i,
        });
        fireEvent.click(fylkesGrenserAccordionButton);

        const checkbox = await screen.findByRole("checkbox", {
          name: /agder/i,
        });
        fireEvent.click(checkbox);

        expect(checkbox).toBeChecked();
        expect(
          screen.getByRole("button", { name: "Synlig" })
        ).toBeInTheDocument();
      });

      it("should close both eye and uncheck checkbox when checkbox is checked", async () => {
        render(<PageLayout />);

        const nibasButton = screen.getByRole("button", { name: /nibas/i });
        fireEvent.click(nibasButton);

        const fylkesGrenserAccordionButton = screen.getByRole("button", {
          name: /fylkesgrenser/i,
        });
        fireEvent.click(fylkesGrenserAccordionButton);

        const checkbox = await screen.findByRole("checkbox", {
          name: /agder/i,
        });
        fireEvent.click(checkbox);
        fireEvent.click(checkbox);

        expect(checkbox).not.toBeChecked();
        expect(
          screen.queryByRole("button", { name: "Synlig" })
        ).not.toBeInTheDocument();
      });
    });
  });
});
