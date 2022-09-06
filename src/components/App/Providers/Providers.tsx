import { FC } from "react";
import ThirdPartyProviders from "./ThirdPartyProviders";
import { BakgrunnskartProvider } from "contexts/BakgrunnskartContext";
import { EditGrenserProvider } from "contexts/EditGrenserContext";
import { MetadataPanelProvider } from "contexts/MetadataPanelContext";
import { SidebarPanelProvider } from "contexts/SidebarPanelContext";
import { UtkastProvider } from "contexts/UtkastContext";

const Providers: FC = ({ children }) => {
  return (
    <ThirdPartyProviders>
      <SidebarPanelProvider>
        <MetadataPanelProvider>
          <EditGrenserProvider>
            <BakgrunnskartProvider>
              <UtkastProvider>{children}</UtkastProvider>
            </BakgrunnskartProvider>
          </EditGrenserProvider>
        </MetadataPanelProvider>
      </SidebarPanelProvider>
    </ThirdPartyProviders>
  );
};

export default Providers;
