import { render, screen } from "test/test-utils";
import { ReactNode } from "react";
import PageLayout from "./PageLayout";

const renderWithProvider = (ui: ReactNode) =>
  render(ui, {
    BakgrunnskartProvider: {
      mappedLayers: [],
      moveLayer: vi.fn(),
      toggleLayerVisibility: vi.fn(),
      recursiveIsVisible: vi.fn(),
      layerIsVisible: vi.fn(),
      subLayerIsVisible: vi.fn(),
      visibleLayers: [],
    },
  });

describe("PageLayout", () => {
  describe("Sidebar", () => {
    it("should close panel on same sidebar button click", async () => {
      const { user } = renderWithProvider(<PageLayout />);

      const bakgrunnskartButton = screen.getByRole("button", {
        name: "map Kartlag",
      });

      await user.click(bakgrunnskartButton);
      await user.click(bakgrunnskartButton);

      expect(
        screen.queryByRole("heading", { name: "bakgrunnskart" })
      ).not.toBeInTheDocument();
    });

    it("should close other panels if another sidebar panel is opened", async () => {
      const { user } = renderWithProvider(<PageLayout />);

      const bakgrunnskartButton = screen.getByRole("button", {
        name: "map Kartlag",
      });
      await user.click(bakgrunnskartButton);

      const nibasButton = screen.getByRole("button", {
        name: "space_dashboard Inndelinger",
      });
      await user.click(nibasButton);

      expect(
        screen.getByRole("heading", { name: "Inndelinger" })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: "Kartlag" })
      ).not.toBeInTheDocument();
    });

    it("should close panel on left caret button click", async () => {
      const { user } = renderWithProvider(<PageLayout />);

      const inndelingerButton = screen.getByRole("button", {
        name: "space_dashboard Inndelinger",
      });
      await user.click(inndelingerButton);

      const closeButton = screen.getByRole("button", {
        name: "Lukk",
      });
      await user.click(closeButton);

      expect(
        screen.queryByRole("heading", { name: "Inndelinger" })
      ).not.toBeInTheDocument();
    });
  });
});
