/* eslint-disable import/export */
import { ReactElement } from "react";
import { render, RenderOptions, RenderResult } from "@testing-library/react";
import ThirdPartyProviders from "components/App/Providers/ThirdPartyProviders";

// https://testing-library.com/docs/react-testing-library/setup/#custom-render

const customRender = (
  ui: ReactElement,
  options: RenderOptions = {}
): RenderResult => render(ui, { wrapper: ThirdPartyProviders, ...options });

export * from "@testing-library/react";
// override render fra pakken over for å alltid wrappe i Providers
export { customRender as render };
