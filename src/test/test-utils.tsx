/* eslint-disable import/export */
import { ReactElement } from "react";
import { render, RenderOptions, RenderResult } from "@testing-library/react";
import Providers from "components/App/Providers";

// https://testing-library.com/docs/react-testing-library/setup/#custom-render

const customRender = (
  ui: ReactElement,
  options: RenderOptions = {}
): RenderResult => render(ui, { wrapper: Providers, ...options });

export * from "@testing-library/react";
// override render fra pakken over for å alltid wrappe i Providers
export { customRender as render };
