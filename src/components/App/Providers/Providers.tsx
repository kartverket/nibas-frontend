import { FC } from "react";
import ThirdPartyProviders from "./ThirdPartyProviders";
import { BakgrunnskartProvider } from "contexts/BakgrunnskartContext";
import { EditGrenserProvider } from "contexts/EditGrenserContext";
import { MetadataPanelProvider } from "contexts/MetadataPanelContext";
import { SidebarPanelProvider } from "contexts/SidebarPanelContext";

const Providers: FC = ({ children }) => {
  return (
    <ThirdPartyProviders>
      <SidebarPanelProvider>
        <MetadataPanelProvider>
          <EditGrenserProvider>
            <BakgrunnskartProvider>{children}</BakgrunnskartProvider>
          </EditGrenserProvider>
        </MetadataPanelProvider>
      </SidebarPanelProvider>
    </ThirdPartyProviders>
  );
};

export default Providers;
