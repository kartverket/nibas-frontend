import { FC } from "react";
import ThirdPartyProviders from "./ThirdPartyProviders";
import { BakgrunnskartProvider } from "contexts/BakgrunnskartContext";
import { EditGrenserProvider } from "contexts/EditGrenserContext";
import { SidebarPanelProvider } from "contexts/SidebarPanelContext";
import { ToolbarProvider } from "contexts/ToolbarContext";
import { UtkastProvider } from "contexts/UtkastContext";
import { ErrorHandlingProvider } from "contexts/ErrorHandlingContext";
import { OverlayPanelProvider } from "contexts/OverlayPanelContext";

const Providers: FC = ({ children }) => {
  return (
    <ThirdPartyProviders>
      <ErrorHandlingProvider>
        <OverlayPanelProvider>
          <SidebarPanelProvider>
            <ToolbarProvider>
              <EditGrenserProvider>
                <BakgrunnskartProvider>
                  <UtkastProvider>{children}</UtkastProvider>
                </BakgrunnskartProvider>
              </EditGrenserProvider>
            </ToolbarProvider>
          </SidebarPanelProvider>
        </OverlayPanelProvider>
      </ErrorHandlingProvider>
    </ThirdPartyProviders>
  );
};

export default Providers;
