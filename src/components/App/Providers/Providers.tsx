import { FC } from "react";
import ThirdPartyProviders from "./ThirdPartyProviders";
import { BakgrunnskartProvider } from "contexts/BakgrunnskartContext";
import { EditGrenserProvider } from "contexts/EditGrenserContext";
import { MetadataPanelProvider } from "contexts/MetadataPanelContext";
import { SidebarPanelProvider } from "contexts/SidebarPanelContext";
import { ToolbarProvider } from "contexts/ToolbarContext";

const Providers: FC = ({ children }) => {
  return (
    <ThirdPartyProviders>
      <SidebarPanelProvider>
        <ToolbarProvider>
          <MetadataPanelProvider>
            <EditGrenserProvider>
              <BakgrunnskartProvider>{children}</BakgrunnskartProvider>
            </EditGrenserProvider>
          </MetadataPanelProvider>
        </ToolbarProvider>
      </SidebarPanelProvider>
    </ThirdPartyProviders>
  );
};

export default Providers;
