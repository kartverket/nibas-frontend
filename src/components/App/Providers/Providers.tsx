import { FC } from "react";
import ThirdPartyProviders from "./ThirdPartyProviders";
import { BakgrunnskartProvider } from "contexts/BakgrunnskartContext";
import { EditGrenserProvider } from "contexts/EditGrenserContext";
import { OverlayPanelsProvider } from "contexts/OverlayPanelsContext";
import { SidebarPanelProvider } from "contexts/SidebarPanelContext";
import { ToolbarProvider } from "contexts/ToolbarContext";
import { UtkastProvider } from "contexts/UtkastContext";

const Providers: FC = ({ children }) => {
  return (
    <ThirdPartyProviders>
      <SidebarPanelProvider>
        <ToolbarProvider>
          <OverlayPanelsProvider>
            <EditGrenserProvider>
              <BakgrunnskartProvider>
                <UtkastProvider>{children}</UtkastProvider>
              </BakgrunnskartProvider>
            </EditGrenserProvider>
          </OverlayPanelsProvider>
        </ToolbarProvider>
      </SidebarPanelProvider>
    </ThirdPartyProviders>
  );
};

export default Providers;
