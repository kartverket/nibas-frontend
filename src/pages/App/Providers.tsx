import { KartlagProvider } from "contexts/KartlagContext/KartlagContext";
import { HistoryProvider } from "contexts/HistoryContext/HistoryContext";
import { UtkastProvider } from "contexts/UtkastContext/UtkastContext";
import { ErrorHandlingProvider } from "contexts/ErrorHandlingContext";
import { OverlayPanelProvider } from "contexts/OverlayPanelContext";
import { FeatureStyleProvider } from "contexts/FeatureStyleContext/FeatureStyleContext";
import { ToolbarProvider } from "contexts/ToolbarContext";
import { ConfirmationModalProvider } from "contexts/ConfirmationModalContext";
import { InndelingerProvider } from "contexts/InndelingerContext/InndelingerContext";
import { AuthRenewProvider } from "components/Authentication/AuthRenewError";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ErrorHandlingProvider>
      <ConfirmationModalProvider>
        <HistoryProvider>
          <FeatureStyleProvider>
            <OverlayPanelProvider>
              <AuthRenewProvider>
                <ToolbarProvider>
                  <KartlagProvider>
                    <UtkastProvider>
                      <InndelingerProvider>{children}</InndelingerProvider>
                    </UtkastProvider>
                  </KartlagProvider>
                </ToolbarProvider>
              </AuthRenewProvider>
            </OverlayPanelProvider>
          </FeatureStyleProvider>
        </HistoryProvider>
      </ConfirmationModalProvider>
    </ErrorHandlingProvider>
  );
};

export default Providers;
