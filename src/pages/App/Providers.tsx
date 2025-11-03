import { KartlagProvider } from "contexts/KartlagContext/KartlagContext";
import { HistoryProvider } from "contexts/HistoryContext/HistoryContext";
import { UtkastProvider } from "contexts/UtkastContext/UtkastContext";
import { ErrorHandlingProvider } from "contexts/ErrorHandlingContext";
import { OverlayPanelProvider } from "contexts/OverlayPanelContext";
import { OverlayPopupProvider } from "contexts/OverlayPopupContext";
import { FeatureStyleProvider } from "contexts/FeatureStyleContext/FeatureStyleContext";
import { ToolbarProvider } from "contexts/ToolbarContext";
import { ConfirmationModalProvider } from "contexts/ConfirmationModalContext";
import { InndelingerProvider } from "contexts/InndelingerContext/InndelingerContext";
import { GyldighetsdatoProvider } from "contexts/GyldighetsdatoContext";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ErrorHandlingProvider>
      <ConfirmationModalProvider>
        <GyldighetsdatoProvider>
          <FeatureStyleProvider>
            <HistoryProvider>
              <OverlayPopupProvider>
                <OverlayPanelProvider>
                  <ToolbarProvider>
                    <KartlagProvider>
                      <UtkastProvider>
                        <InndelingerProvider>{children}</InndelingerProvider>
                      </UtkastProvider>
                    </KartlagProvider>
                  </ToolbarProvider>
                </OverlayPanelProvider>
              </OverlayPopupProvider>
            </HistoryProvider>
          </FeatureStyleProvider>
        </GyldighetsdatoProvider>
      </ConfirmationModalProvider>
    </ErrorHandlingProvider>
  );
};

export default Providers;
