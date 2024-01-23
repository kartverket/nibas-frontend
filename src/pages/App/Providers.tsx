import ThirdPartyProviders from "./ThirdPartyProviders";
import { KartlagProvider } from "contexts/KartlagContext/KartlagContext";
import { EditGrenserProvider } from "contexts/EditGrenserContext";
import { SidebarPanelProvider } from "contexts/SidebarPanelContext";
import { HistoryProvider } from "contexts/HistoryContext";
import { UtkastProvider } from "contexts/UtkastContext";
import { ErrorHandlingProvider } from "contexts/ErrorHandlingContext";
import { OverlayPanelProvider } from "contexts/OverlayPanelContext";
import { FeatureStyleProvider } from "contexts/FeatureStyleContext";
import { ToolbarProvider } from "contexts/ToolbarContext";
import { InndelingerProvider } from "contexts/InndelingerContekst/InndelingerContext";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThirdPartyProviders>
      <ErrorHandlingProvider>
        <HistoryProvider>
          <FeatureStyleProvider>
            <ToolbarProvider>
              <SidebarPanelProvider>
                <OverlayPanelProvider>
                  <InndelingerProvider>
                    <EditGrenserProvider>
                      <KartlagProvider>
                        <UtkastProvider>{children}</UtkastProvider>
                      </KartlagProvider>
                    </EditGrenserProvider>
                  </InndelingerProvider>
                </OverlayPanelProvider>
              </SidebarPanelProvider>
            </ToolbarProvider>
          </FeatureStyleProvider>
        </HistoryProvider>
      </ErrorHandlingProvider>
    </ThirdPartyProviders>
  );
};

export default Providers;
