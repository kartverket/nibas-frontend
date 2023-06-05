/* eslint-disable import/export */
import { ReactNode } from "react";
import { render, RenderOptions, RenderResult } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserEvent } from "@testing-library/user-event/dist/types/setup/setup";
import { renderWithProviders, TestProviderValues } from "./test-providers";

// https://testing-library.com/docs/react-testing-library/setup/#custom-render

type Options = RenderOptions & TestProviderValues;

const customRender = (
  ui: ReactNode,
  options: Options = {}
): RenderResult & { user: UserEvent } => {
  const user = userEvent.setup();

  const {
    ErrorHandlingProvider,
    BakgrunnskartProvider,
    EditGrenserProvider,
    OverlayPanelProvider,
    SidebarPanelProvider,
    HistoryProvider,
    UtkastProvider,
    ...rltOptions
  } = options;

  return {
    user,
    ...render(
      renderWithProviders(ui, {
        ErrorHandlingProvider,
        BakgrunnskartProvider,
        EditGrenserProvider,
        OverlayPanelProvider,
        SidebarPanelProvider,
        HistoryProvider,
        UtkastProvider,
      }),
      rltOptions
    ),
  };
};

export * from "@testing-library/react";
// override render fra pakken over for å alltid wrappe i Providers
export { customRender as render };
