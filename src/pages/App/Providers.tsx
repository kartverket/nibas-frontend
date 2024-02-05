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

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThirdPartyProviders>
      <ErrorHandlingProvider>
        <HistoryProvider>
          <EditGrenserProvider>
            <FeatureStyleProvider>
              <ToolbarProvider>
                <SidebarPanelProvider>
                  <OverlayPanelProvider>
                    <KartlagProvider>
                      <UtkastProvider>{children}</UtkastProvider>
                    </KartlagProvider>
                  </OverlayPanelProvider>
                </SidebarPanelProvider>
              </ToolbarProvider>
            </FeatureStyleProvider>
          </EditGrenserProvider>
        </HistoryProvider>
      </ErrorHandlingProvider>
    </ThirdPartyProviders>
  );
};

export default Providers;
