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
  BakgrunnskartProvider?: BakgrunnskartContextValue;
  EditGrenserProvider?: EditGrenserContextValue;
  MetadataPanelProvider?: MetadataPanelContextValue;
  SidebarPanelProvider?: SidebarPanelContextValue;
  ToolbarProvider?: ToolbarContextValue;
  UtkastProvider?: UtkastContextValue;
};

type ProviderName = keyof typeof defaultProviderMap;

export const renderWithProviders = (
  ui: ReactNode,
  providerValues: TestProviderValues = {}
) => {
  return (
    <ThirdPartyProviders>
      <BrowserRouter>
        {Object.keys(defaultProviderMap).reduceRight((acc, name) => {
          const providerName = name as ProviderName;

          // bruk override dersom det er sendt med
          if (providerValues[providerName]) {
            const Provider = contextMap[providerName];
            const value = providerValues[providerName];

            // TS skjønner ikke at value tilhører Provider her, så vi kjører en liten 🤠
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return <Provider value={value as any}>{acc}</Provider>;
          }

          const Provider = defaultProviderMap[providerName];
          return <Provider>{acc}</Provider>;
        }, ui)}
      </BrowserRouter>
    </ThirdPartyProviders>
  );
};
