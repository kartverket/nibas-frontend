import { render, screen } from "test/test-utils";
import { ReactNode } from "react";
import PageLayout from "./PageLayout";

const renderWithProvider = (ui: ReactNode) =>
  render(ui, {
    BakgrunnskartProvider: {
      mappedLayers: [],
      moveLayer: jest.fn(),
      orderedLayerIds: [],
      toggleLayerVisibility: jest.fn(),
      visibleLayers: {} as any,
    },
  });

describe("PageLayout", () => {
  describe("Sidebar", () => {
    it("should close panel on same sidebar button click", async () => {
      const { user } = renderWithProvider(<PageLayout />);

      const bakgrunnskartButton = screen.getByRole("button", {
        name: /kartlag/i,
      });
      await user.click(bakgrunnskartButton);
      await user.click(bakgrunnskartButton);

      expect(
        screen.queryByRole("heading", { name: /bakgrunnskart/i })
      ).not.toBeInTheDocument();
    });

    it("should close other panels if another sidebar panel is opened", async () => {
      const { user } = renderWithProvider(<PageLayout />);

      const bakgrunnskartButton = screen.getByRole("button", {
        name: /sidebar.kartlag/i,
      });
      await user.click(bakgrunnskartButton);

      const nibasButton = screen.getByRole("button", {
        name: /sidebar.inndelinger/i,
      });
      await user.click(nibasButton);

      expect(
        screen.getByRole("heading", { name: /sidebar.inndelinger/i })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: /sidebar.kartlag/i })
      ).not.toBeInTheDocument();
    });

    it("should close panel on left caret button click", async () => {
      const { user } = renderWithProvider(<PageLayout />);

      const inndelingerButton = screen.getByRole("button", {
        name: /sidebar.inndelinger/i,
      });
      await user.click(inndelingerButton);

      const closeButton = screen.getByRole("button", {
        name: /lukk sidebar.inndelinger/i,
      });
      await user.click(closeButton);

      expect(
        screen.queryByRole("heading", { name: /sidebar.inndelinger/i })
      ).not.toBeInTheDocument();
    });
  });
});
