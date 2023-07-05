import { ReactNode } from "react";
import {
  BakgrunnskartProvider,
  BakgrunnskartContext,
  BakgrunnskartContextValue,
} from "contexts/BakgrunnskartContext";
import {
  EditGrenserProvider,
  EditGrenserContext,
  EditGrenserContextValue,
} from "contexts/EditGrenserContext";
import {
  OverlayPanelProvider,
  OverlayPanelContext,
  OverlayPanelContextValue,
} from "contexts/OverlayPanelContext";
import {
  SidebarPanelProvider,
  SidebarPanelContext,
  SidebarPanelContextValue,
} from "contexts/SidebarPanelContext";
import {
  HistoryProvider,
  HistoryContext,
  HistoryContextValue,
} from "contexts/HistoryContext";
import {
  ToolbarProvider,
  ToolbarContext,
  ToolbarContextValue,
} from "contexts/ToolbarContext";
import {
  FeatureStyleProvider,
  FeatureStyleContext,
  FeatureStyleContextValue,
} from "contexts/FeatureStyleContext";
import {
  UtkastProvider,
  UtkastContext,
  UtkastContextValue,
} from "contexts/UtkastContext";
import {
  ErrorHandlingContext,
  ErrorHandlingContextValue,
  ErrorHandlingProvider,
} from "contexts/ErrorHandlingContext";
import ThirdPartyProviders from "pages/App/ThirdPartyProviders";
import { BrowserRouter } from "react-router-dom";

// OBS! Rekkefølgen her må være den samme som i Providers.tsx
const defaultProviderMap = {
  ErrorHandlingProvider,
  HistoryProvider,
  ToolbarProvider,
  FeatureStyleProvider,
  SidebarPanelProvider,
  OverlayPanelProvider,
  EditGrenserProvider,
  BakgrunnskartProvider,
  UtkastProvider,
};

const contextMap = {
  ErrorHandlingProvider: ErrorHandlingContext.Provider,
  HistoryProvider: HistoryContext.Provider,
  ToolbarProvider: ToolbarContext.Provider,
  FeatureStyleProvider: FeatureStyleContext.Provider,
  SidebarPanelProvider: SidebarPanelContext.Provider,
  OverlayPanelProvider: OverlayPanelContext.Provider,
  EditGrenserProvider: EditGrenserContext.Provider,
  BakgrunnskartProvider: BakgrunnskartContext.Provider,
  UtkastProvider: UtkastContext.Provider,
};

export type TestProviderValues = {
  ErrorHandlingProvider?: ErrorHandlingContextValue | boolean;
  HistoryProvider?: HistoryContextValue | boolean;
  ToolbarProvider?: ToolbarContextValue | boolean;
  FeatureStyleProvider?: FeatureStyleContextValue | boolean;
  SidebarPanelProvider?: SidebarPanelContextValue | boolean;
  OverlayPanelProvider?: OverlayPanelContextValue | boolean;
  EditGrenserProvider?: EditGrenserContextValue | boolean;
  BakgrunnskartProvider?: BakgrunnskartContextValue | boolean;
  UtkastProvider?: UtkastContextValue | boolean;
};

type ProviderName = keyof typeof defaultProviderMap;

export const renderWithProviders = (
  ui: ReactNode,
  providerValues: TestProviderValues = {}
) => {
  // BakgrunnskartProvider lager kvalme i testene våre, så den er default av
  if (providerValues.BakgrunnskartProvider === undefined) {
    providerValues.BakgrunnskartProvider = false;
  }

  return (
    <ThirdPartyProviders>
      <BrowserRouter>
        {Object.keys(defaultProviderMap).reduceRight((acc, name) => {
          const providerName = name as ProviderName;
          const value = providerValues[providerName];

          if (value === true || value === undefined) {
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
};
