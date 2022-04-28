import { render, screen } from "test/test-utils";
import userEvent from "@testing-library/user-event";
import PageLayout from "./PageLayout";

describe("PageLayout", () => {
  describe("Sidebar", () => {
    it("should close panel on same sidebar button click", () => {
      render(<PageLayout />);

      const bakgrunnskartButton = screen.getByRole("button", {
        name: /kartlag/i,
      });
      userEvent.click(bakgrunnskartButton);
      userEvent.click(bakgrunnskartButton);

      expect(
        screen.queryByRole("heading", { name: /bakgrunnskart/i })
      ).not.toBeInTheDocument();
    });

    it("should close other panels if another sidebar panel is opened", () => {
      render(<PageLayout />);

      const bakgrunnskartButton = screen.getByRole("button", {
        name: /sidebar.kartlag/i,
      });
      userEvent.click(bakgrunnskartButton);

      const nibasButton = screen.getByRole("button", {
        name: /sidebar.inndelinger/i,
      });
      userEvent.click(nibasButton);

      expect(
        screen.getByRole("heading", { name: /sidebar.inndelinger/i })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: /sidebar.kartlag/i })
      ).not.toBeInTheDocument();
    });

    it("should close panel on left caret button click", () => {
      render(<PageLayout />);

      const bakgrunnskartButton = screen.getByRole("button", {
        name: /sidebar.kartlag/i,
      });
      userEvent.click(bakgrunnskartButton);

      const closeButton = screen.getByRole("button", {
        name: /lukk sidebar.kartlag/i,
      });
      userEvent.click(closeButton);

      expect(
        screen.queryByRole("heading", { name: /sidebar.kartlag/i })
      ).not.toBeInTheDocument();
    });
  });

  describe("Background layers panel", () => {
    it("should not render when not visible", () => {
      render(<PageLayout />);

      expect(
        screen.queryByRole("heading", { name: /sidebar.kartlag/i })
      ).not.toBeInTheDocument();
    });

    it("should open bakgrunnskart panel on bakgrunsskart button click", async () => {
      render(<PageLayout />);

      const bakgrunnskartButton = screen.getByRole("button", {
        name: /sidebar.kartlag/i,
      });
      userEvent.click(bakgrunnskartButton);

      expect(
        screen.getByRole("heading", { name: /sidebar.kartlag/i })
      ).toBeInTheDocument();
      expect(
        await screen.findByText(
          "Administrative enheter WMS versjon 2",
          undefined,
          { timeout: 3000 }
        )
      ).toBeInTheDocument();
    });

    it("should toggle visibility of WMS layer on eye click", async () => {
      render(<PageLayout />);

      const bakgrunnskartButton = screen.getByRole("button", {
        name: /sidebar.kartlag/i,
      });
      userEvent.click(bakgrunnskartButton);

      const showLayerButton = await screen.findByRole(
        "button",
        {
          name: /vis Administrative enheter WMS versjon 2/i,
        },
        {
          timeout: 3000,
        }
      );
      userEvent.click(showLayerButton);

      const hideLayerButton = await screen.findByRole("button", {
        name: /skjul Administrative enheter WMS versjon 2/i,
      });
      userEvent.click(hideLayerButton);

      expect(showLayerButton).toBeInTheDocument();
    });

    it("should toggle visibility of WMTS layer on eye click", async () => {
      render(<PageLayout />);

      const bakgrunnskartButton = screen.getByRole("button", {
        name: /sidebar.kartlag/i,
      });
      userEvent.click(bakgrunnskartButton);

      const showLayerButton = await screen.findByRole(
        "button",
        {
          name: /vis Nibcache_UTM33_EUREF89_v2/i,
        },
        { timeout: 3000 }
      );
      userEvent.click(showLayerButton);

      const hideLayerButton = await screen.findByRole("button", {
        name: /skjul Nibcache_UTM33_EUREF89_v2/i,
      });
      userEvent.click(hideLayerButton);

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

    it("should open inndelinger panel on nibas sidebar button click", () => {
      render(<PageLayout />);

      const nibasButton = screen.getByRole("button", {
        name: /sidebar.inndelinger/i,
      });
      userEvent.click(nibasButton);

      expect(
        screen.getByRole("heading", { name: /sidebar.inndelinger/i })
      ).toBeInTheDocument();
    });

    it("should render all accordions", async () => {
      render(<PageLayout />);

      const nibasButton = screen.getByRole("button", {
        name: /sidebar.inndelinger/i,
      });
      userEvent.click(nibasButton);

      expect(screen.getByText(/riksgrenser/i)).toBeInTheDocument();
      expect(screen.getByText(/fylkesgrenser/i)).toBeInTheDocument();
      expect(screen.getByText(/kommunegrenser/i)).toBeInTheDocument();
      expect(screen.getByText(/stemmekretser/i)).toBeInTheDocument();
      expect(screen.getByText(/skolekretser/i)).toBeInTheDocument();
      expect(screen.getByText(/grunnkretser/i)).toBeInTheDocument();
      expect(screen.getByText(/delområder/i)).toBeInTheDocument();
      expect(screen.getByText(/postnummerområder/i)).toBeInTheDocument();
      expect(screen.getByText(/gestlige inndelinger/i)).toBeInTheDocument();
      expect(screen.getByText(/maritime grenser/i)).toBeInTheDocument();
      expect(screen.getByText(/svalbardområdet/i)).toBeInTheDocument();
    });

    it("should show fylker on Fylker accordion click", async () => {
      render(<PageLayout />);

      const nibasButton = screen.getByRole("button", {
        name: /sidebar.inndelinger/i,
      });
      userEvent.click(nibasButton);

      const fylkesGrenserAccordionButton = screen.getByRole("button", {
        name: /inndelinger.fylkesgrenser/i,
      });
      userEvent.click(fylkesGrenserAccordionButton);

      expect(
        await screen.findByText(/vestfold og telemark/i)
      ).toBeInTheDocument();
      expect(await screen.findByText(/agder/i)).toBeInTheDocument();
    });

    it("should show fylker and kommuner on Kommuner accordion click", async () => {
      render(<PageLayout />);

      const nibasButton = screen.getByRole("button", {
        name: /sidebar.inndelinger/i,
      });
      userEvent.click(nibasButton);

      const kommuneGrenserAccordionButton = screen.getByRole("button", {
        name: /inndelinger.kommunegrenser/i,
      });
      userEvent.click(kommuneGrenserAccordionButton);

      const agderAccordionButton = await screen.findByRole("button", {
        name: /agder/i,
      });
      userEvent.click(agderAccordionButton);

      expect(await screen.findByText(/malvik/i)).toBeInTheDocument();
      expect(await screen.findByText(/giske/i)).toBeInTheDocument();
    });

    describe("ToggleableGrense", () => {
      it("should open eye on eye click", async () => {
        render(<PageLayout />);

        const nibasButton = screen.getByRole("button", {
          name: /sidebar.inndelinger/i,
        });
        userEvent.click(nibasButton);

        const fylkesGrenserAccordionButton = screen.getByRole("button", {
          name: /inndelinger.fylkesgrenser/i,
        });
        userEvent.click(fylkesGrenserAccordionButton);

        const closedEyes = await screen.findAllByRole("button", {
          name: "Usynlig",
        });
        const openEyesBeforeClick = screen.queryAllByRole("button", {
          name: "Synlig",
        });

        userEvent.click(closedEyes[0]);

        const openEye = screen.getByRole("button", { name: "Synlig" });
        expect(openEye).toBeInTheDocument();
        expect(openEyesBeforeClick).toHaveLength(0);
      });

      it("should open eye and check checkbox on checkbox click", async () => {
        render(<PageLayout />);

        const nibasButton = screen.getByRole("button", {
          name: /sidebar.inndelinger/i,
        });
        userEvent.click(nibasButton);

        const fylkesGrenserAccordionButton = screen.getByRole("button", {
          name: /inndelinger.fylkesgrenser/i,
        });
        userEvent.click(fylkesGrenserAccordionButton);

        const checkbox = await screen.findByRole("checkbox", {
          name: /agder/i,
        });
        userEvent.click(checkbox);

        expect(checkbox).toBeChecked();
        expect(
          screen.getByRole("button", { name: "Synlig" })
        ).toBeInTheDocument();
      });

      it("should close both eye and uncheck checkbox when checkbox is checked", async () => {
        render(<PageLayout />);

        const nibasButton = screen.getByRole("button", {
          name: /sidebar.inndelinger/i,
        });
        userEvent.click(nibasButton);

        const fylkesGrenserAccordionButton = screen.getByRole("button", {
          name: /inndelinger.fylkesgrenser/i,
        });
        userEvent.click(fylkesGrenserAccordionButton);

        const checkbox = await screen.findByRole("checkbox", {
          name: /agder/i,
        });
        userEvent.click(checkbox);
        userEvent.click(checkbox);

        expect(checkbox).not.toBeChecked();
        expect(
          screen.queryByRole("button", { name: "Synlig" })
        ).not.toBeInTheDocument();
      });
    });
  });
});
