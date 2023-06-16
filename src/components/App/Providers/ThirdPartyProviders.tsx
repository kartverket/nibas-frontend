import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { SWRConfig } from "swr";

const swrGlobalConfig = {
  revalidateOnFocus: false,
};

const ThirdPartyProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <SWRConfig value={swrGlobalConfig}>{children}</SWRConfig>
    </DndProvider>
  );
};

export default ThirdPartyProviders;
