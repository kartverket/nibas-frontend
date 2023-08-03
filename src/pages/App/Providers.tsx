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
import { LoadingProvider } from "contexts/LoadingContext";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThirdPartyProviders>
      <LoadingProvider>
        <ErrorHandlingProvider>
          <HistoryProvider>
            <ToolbarProvider>
              <FeatureStyleProvider>
                <SidebarPanelProvider>
                  <OverlayPanelProvider>
                    <EditGrenserProvider>
                      <KartlagProvider>
                        <UtkastProvider>{children}</UtkastProvider>
                      </KartlagProvider>
                    </EditGrenserProvider>
                  </OverlayPanelProvider>
                </SidebarPanelProvider>
              </FeatureStyleProvider>
            </ToolbarProvider>
          </HistoryProvider>
        </ErrorHandlingProvider>
      </LoadingProvider>
    </ThirdPartyProviders>
  );
};

export default Providers;
