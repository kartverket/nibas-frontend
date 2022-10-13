/* eslint-disable import/export */
import { ReactNode } from "react";
import { render, RenderOptions, RenderResult } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserEvent } from "@testing-library/user-event/dist/types/setup/setup";
import { renderWithProviders, TestProviderValues } from "./test-providers";

// https://testing-library.com/docs/react-testing-library/setup/#custom-render

const customRender = (
  ui: ReactNode,
  options: RenderOptions = {},
  providerValues?: TestProviderValues
): RenderResult & { user: UserEvent } => {
  const user = userEvent.setup();
  return { user, ...render(renderWithProviders(ui, providerValues), options) };
};

export * from "@testing-library/react";
// override render fra pakken over for å alltid wrappe i Providers
export { customRender as render };
