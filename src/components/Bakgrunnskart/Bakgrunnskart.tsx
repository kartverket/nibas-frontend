import MainLayer from "./MainLayer";
import { SidebarPanel } from "components/Sidebar/SidebarPanel";
import SidebarPanelTitle from "components/Sidebar/SidebarPanelTitle";
import { useBakgrunnskart } from "contexts/BakgrunnskartContext";
import { useSidebarPanel } from "contexts/SidebarPanelContext";
import { bakgrunnskartLayers } from "hooks/layers/constants";
import { BakgrunnskartId } from "hooks/layers/types";
import { Divider, Heading } from "@kvib/react";

const Bakgrunnskart = () => {
  const { activeSidebarPanel, closeSidebarPanel } = useSidebarPanel();
  const { visibleLayers } = useBakgrunnskart();

  return (
    <SidebarPanel isOpen={activeSidebarPanel === "kartlag"}>
      <SidebarPanelTitle
        closePanel={closeSidebarPanel}
        title="Aktive kartlag"
      />
      {visibleLayers.map((layer, i) => (
        <MainLayer
          key={layer.mainLayer}
          layerId={layer.mainLayer}
          index={i}
          isAktiveKartlag={true}
          canDrag={true}
        />
      ))}
      <Heading as="h3" size="sm">
        Kartlag
      </Heading>
      <Divider />
      {Object.keys(bakgrunnskartLayers).map((layerId, index) => (
        <MainLayer
          key={layerId}
          layerId={layerId as BakgrunnskartId}
          index={index}
        />
      ))}
    </SidebarPanel>
  );
};

export default Bakgrunnskart;
