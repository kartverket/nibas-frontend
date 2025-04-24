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
import { AuthRenewProvider } from "components/Authentication/AuthRenewError";
import { GyldighetsdatoProvider } from "contexts/GyldighetsdatoContext";
import { KodelisteProvider } from "contexts/KodelisteContext";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ErrorHandlingProvider>
      <ConfirmationModalProvider>
        <GyldighetsdatoProvider>
          <FeatureStyleProvider>
            <HistoryProvider>
              <OverlayPopupProvider>
                <OverlayPanelProvider>
                  <AuthRenewProvider>
                    <ToolbarProvider>
                      <KartlagProvider>
                        <UtkastProvider>
                          <InndelingerProvider>
                            <KodelisteProvider>{children}</KodelisteProvider>
                          </InndelingerProvider>
                        </UtkastProvider>
                      </KartlagProvider>
                    </ToolbarProvider>
                  </AuthRenewProvider>
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
