/* eslint-disable import/export */
import { ReactNode } from "react";
import { render, RenderOptions, RenderResult } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, TestProviderValues } from "./test-providers";

// https://testing-library.com/docs/react-testing-library/setup/#custom-render

type Options = RenderOptions & TestProviderValues;

const customRender = (
  ui: ReactNode,
  options: Options = {},
): RenderResult & { user: ReturnType<typeof userEvent.setup> } => {
  const user = userEvent.setup();

  const {
    ErrorHandlingProvider,
    HistoryProvider,
    ToolbarProvider,
    FeatureStyleProvider,
    SidebarPanelProvider,
    OverlayPanelProvider,
    EditGrenserProvider,
    KartlagProvider,
    UtkastProvider,
    ...rltOptions
  } = options;

  return {
    user,
    ...render(
      renderWithProviders(ui, {
        ErrorHandlingProvider,
        HistoryProvider,
        ToolbarProvider,
        FeatureStyleProvider,
        SidebarPanelProvider,
        OverlayPanelProvider,
        EditGrenserProvider,
        KartlagProvider,
        UtkastProvider,
      }),
      rltOptions,
    ),
  };
};

export * from "@testing-library/react";
// override render fra pakken over for å alltid wrappe i Providers
export { customRender as render };
