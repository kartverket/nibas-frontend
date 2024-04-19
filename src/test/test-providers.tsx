import { ReactNode } from "react";
import { KartlagProvider, KartlagContext, KartlagContextValue } from "contexts/KartlagContext/KartlagContext";
import { OverlayPanelProvider, OverlayPanelContext, OverlayPanelContextValue } from "contexts/OverlayPanelContext";
import { HistoryProvider, HistoryContext } from "contexts/HistoryContext/HistoryContext";
import { HistoryContextValue } from "contexts/HistoryContext/types";
import { ToolbarProvider, ToolbarContext, ToolbarContextValue } from "contexts/ToolbarContext";
import { FeatureStyleProvider, FeatureStyleContext } from "contexts/FeatureStyleContext/FeatureStyleContext";
import { FeatureStyleContextValue } from "contexts/FeatureStyleContext/types";
import { UtkastProvider, UtkastContext } from "contexts/UtkastContext/UtkastContext";
import { UtkastContextValue } from "contexts/UtkastContext/types";
import { ErrorHandlingContext, ErrorHandlingContextValue, ErrorHandlingProvider } from "contexts/ErrorHandlingContext";
import ThirdPartyProviders from "pages/App/ThirdPartyProviders";
import { BrowserRouter } from "react-router-dom";
import {
  ConfirmationModalContext,
  ConfirmationModalContextValue,
  ConfirmationModalProvider,
} from "contexts/ConfirmationModalContext";

// OBS! Rekkefølgen her må være den samme som i Providers.tsx
const defaultProviderMap = {
  ErrorHandlingProvider,
  ConfirmationModalProvider,
  HistoryProvider,
  FeatureStyleProvider,
  ToolbarProvider,
  OverlayPanelProvider,
  KartlagProvider,
  UtkastProvider,
};

const contextMap = {
  ErrorHandlingProvider: ErrorHandlingContext.Provider,
  ConfirmationModalProvider: ConfirmationModalContext.Provider,
  HistoryProvider: HistoryContext.Provider,
  ToolbarProvider: ToolbarContext.Provider,
  FeatureStyleProvider: FeatureStyleContext.Provider,
  OverlayPanelProvider: OverlayPanelContext.Provider,
  KartlagProvider: KartlagContext.Provider,
  UtkastProvider: UtkastContext.Provider,
};

export type TestProviderValues = {
  ErrorHandlingProvider?: ErrorHandlingContextValue | boolean;
  ConfirmationModalProvider?: ConfirmationModalContextValue | boolean;
  HistoryProvider?: HistoryContextValue | boolean;
  ToolbarProvider?: ToolbarContextValue | boolean;
  FeatureStyleProvider?: FeatureStyleContextValue | boolean;
  OverlayPanelProvider?: OverlayPanelContextValue | boolean;
  KartlagProvider?: KartlagContextValue | boolean;
  UtkastProvider?: UtkastContextValue | boolean;
};

type ProviderName = keyof typeof defaultProviderMap;

export const renderWithProviders = (ui: ReactNode, providerValues: TestProviderValues = {}) => (
  <ThirdPartyProviders>
    <BrowserRouter>
      {Object.keys(defaultProviderMap).reduceRight((acc, name) => {
        const providerName = name as ProviderName;
        const value = providerValues[providerName];

        if (value === true || value == null) {
          // hvis ikke satt eller eksplisitt satt til true, wrap i default provider
          const Provider = defaultProviderMap[providerName];
          return <Provider>{acc}</Provider>;
        } else if (value === false) {
          // hvis satt til false, ikke wrap i noen provider
          return acc;
        }

        // ellers bruk override
        const Provider = contextMap[providerName];

        // TS skjønner ikke at value tilhører Provider her, så vi kjører en liten 🤠
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return <Provider value={value as any}>{acc}</Provider>;
      }, ui)}
    </BrowserRouter>
  </ThirdPartyProviders>
);
