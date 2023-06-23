import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { SWRConfig } from "swr";
import { KvibProvider } from "@kvib/react";

const swrGlobalConfig = {
  revalidateOnFocus: false,
};

const ThirdPartyProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <KvibProvider>
        <SWRConfig value={swrGlobalConfig}>{children}</SWRConfig>
      </KvibProvider>
    </DndProvider>
  );
};

export default ThirdPartyProviders;
