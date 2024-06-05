import { OverlayPanelContext } from "contexts/OverlayPanelContext";
import { ReactNode } from "react";

/* eslint-disable  @typescript-eslint/no-explicit-any */

export const mockPanelValues = {
  activeOverlayModal: vitest.fn(),
  activeOverlayPanel: vitest.fn(),
  openOverlayModal: vitest.fn(),
  openOverlayPanel: vitest.fn(),
  closeOverlayModal: vitest.fn(),
  closeOverlayPanel: vitest.fn(),
  toggleOverlayModal: vitest.fn(),
  toggleOverlayPanel: vitest.fn(),
};

export const MockOverlayPanelProvider = ({ children }: { children: ReactNode }) => {
  return <OverlayPanelContext.Provider value={mockPanelValues as any}>{children}</OverlayPanelContext.Provider>;
};
