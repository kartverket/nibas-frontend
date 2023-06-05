import { FC } from "react";
import ThirdPartyProviders from "./ThirdPartyProviders";
import { BakgrunnskartProvider } from "contexts/BakgrunnskartContext";
import { EditGrenserProvider } from "contexts/EditGrenserContext";
import { SidebarPanelProvider } from "contexts/SidebarPanelContext";
import { HistoryProvider } from "contexts/HistoryContext";
import { UtkastProvider } from "contexts/UtkastContext";
import { ErrorHandlingProvider } from "contexts/ErrorHandlingContext";
import { OverlayPanelProvider } from "contexts/OverlayPanelContext";

const Providers: FC = ({ children }) => {
  return (
    <ThirdPartyProviders>
      <ErrorHandlingProvider>
        <SidebarPanelProvider>
          <OverlayPanelProvider>
            <HistoryProvider>
              <EditGrenserProvider>
                <BakgrunnskartProvider>
                  <UtkastProvider>{children}</UtkastProvider>
                </BakgrunnskartProvider>
              </EditGrenserProvider>
            </HistoryProvider>
          </OverlayPanelProvider>
        </SidebarPanelProvider>
      </ErrorHandlingProvider>
    </ThirdPartyProviders>
  );
};

export default Providers;
