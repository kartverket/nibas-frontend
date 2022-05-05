import { render, screen } from "test/test-utils";
import { ReactNode } from "react";
import userEvent from "@testing-library/user-event";
import PageLayout from "./PageLayout";
import {
  BakgrunnskartContext,
  BakgrunnskartContextValue,
} from "contexts/BakgrunnskartContext";
import { MetadataPanelProvider } from "contexts/MetadataPanelContext";
import { SidebarPanelProvider } from "contexts/SidebarPanelContext";

const renderWithProvider = (
  ui: ReactNode,
  providerProps: BakgrunnskartContextValue = {
    mappedLayers: [],
    moveLayer: jest.fn(),
    orderedLayerIds: [],
    toggleLayerVisibility: jest.fn(),
    visibleLayers: {} as any,
  }
) =>
  render(
    <SidebarPanelProvider>
      <MetadataPanelProvider>
        <BakgrunnskartContext.Provider value={providerProps}>
          {ui}
        </BakgrunnskartContext.Provider>
      </MetadataPanelProvider>
    </SidebarPanelProvider>
  );

describe("PageLayout", () => {
  describe("Sidebar", () => {
    it("should close panel on same sidebar button click", () => {
      renderWithProvider(<PageLayout />);

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
      renderWithProvider(<PageLayout />);

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
      renderWithProvider(<PageLayout />);

      const inndelingerButton = screen.getByRole("button", {
        name: /sidebar.inndelinger/i,
      });
      userEvent.click(inndelingerButton);

      const closeButton = screen.getByRole("button", {
        name: /lukk sidebar.inndelinger/i,
      });
      userEvent.click(closeButton);

      expect(
        screen.queryByRole("heading", { name: /sidebar.inndelinger/i })
      ).not.toBeInTheDocument();
    });
  });
});
