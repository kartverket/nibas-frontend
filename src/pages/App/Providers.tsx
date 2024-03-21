import { KartlagProvider } from "contexts/KartlagContext/KartlagContext";
import { EditGrenserProvider } from "contexts/EditGrenserContext/EditGrenserContext";
import { SidebarPanelProvider } from "contexts/SidebarPanelContext";
import { HistoryProvider } from "contexts/HistoryContext/HistoryContext";
import { UtkastProvider } from "contexts/UtkastContext/UtkastContext";
import { ErrorHandlingProvider } from "contexts/ErrorHandlingContext";
import { OverlayPanelProvider } from "contexts/OverlayPanelContext";
import { FeatureStyleProvider } from "contexts/FeatureStyleContext/FeatureStyleContext";
import { ToolbarProvider } from "contexts/ToolbarContext";
import { ConfirmationModalProvider } from "contexts/ConfirmationModalContext";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ErrorHandlingProvider>
      <ConfirmationModalProvider>
        <HistoryProvider>
          <FeatureStyleProvider>
            <ToolbarProvider>
              <SidebarPanelProvider>
                <OverlayPanelProvider>
                  <EditGrenserProvider>
                    <KartlagProvider>
                      <UtkastProvider>{children}</UtkastProvider>
                    </KartlagProvider>
                  </EditGrenserProvider>
                </OverlayPanelProvider>
              </SidebarPanelProvider>
            </ToolbarProvider>
          </FeatureStyleProvider>
        </HistoryProvider>
      </ConfirmationModalProvider>
    </ErrorHandlingProvider>
  );
};

export default Providers;
