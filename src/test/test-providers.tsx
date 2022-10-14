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
  MetadataPanelProvider,
  MetadataPanelContext,
  MetadataPanelContextValue,
} from "contexts/MetadataPanelContext";
import {
  SidebarPanelProvider,
  SidebarPanelContext,
  SidebarPanelContextValue,
} from "contexts/SidebarPanelContext";
import {
  ToolbarProvider,
  ToolbarContext,
  ToolbarContextValue,
} from "contexts/ToolbarContext";
import {
  UtkastProvider,
  UtkastContext,
  UtkastContextValue,
} from "contexts/UtkastContext";
import ThirdPartyProviders from "components/App/Providers/ThirdPartyProviders";
import { BrowserRouter } from "react-router-dom";

const defaultProviderMap = {
  BakgrunnskartProvider,
  EditGrenserProvider,
  MetadataPanelProvider,
  SidebarPanelProvider,
  ToolbarProvider,
  UtkastProvider,
};

const contextMap = {
  BakgrunnskartProvider: BakgrunnskartContext.Provider,
  EditGrenserProvider: EditGrenserContext.Provider,
  MetadataPanelProvider: MetadataPanelContext.Provider,
  SidebarPanelProvider: SidebarPanelContext.Provider,
  ToolbarProvider: ToolbarContext.Provider,
  UtkastProvider: UtkastContext.Provider,
};

export type TestProviderValues = {
  BakgrunnskartProvider?: BakgrunnskartContextValue | boolean;
  EditGrenserProvider?: EditGrenserContextValue | boolean;
  MetadataPanelProvider?: MetadataPanelContextValue | boolean;
  SidebarPanelProvider?: SidebarPanelContextValue | boolean;
  ToolbarProvider?: ToolbarContextValue | boolean;
  UtkastProvider?: UtkastContextValue | boolean;
};

type ProviderName = keyof typeof defaultProviderMap;

export const renderWithProviders = (
  ui: ReactNode,
  providerValues: TestProviderValues = {
    BakgrunnskartProvider: false,
  }
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
