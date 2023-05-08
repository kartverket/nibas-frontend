import GrunnkretsPanel from "./GrunnkretsPanel/GrunnkretsPanel";
import MetadataPanel from "./MetadataPanel/MetadataPanel";
import StemmekretsPanel from "./StemmekretsPanel/StemmekretsPanel";
import { useOverlayPanel } from "contexts/OverlayPanelContext";

const OverlayPanels = () => {
  const { activeOverlayPanel, setActiveOverlayPanel } = useOverlayPanel();

  return (
    <>
      <MetadataPanel
        isOpen={activeOverlayPanel === "metadata"}
        onClose={() => setActiveOverlayPanel(null)}
      />
      <StemmekretsPanel
        isOpen={activeOverlayPanel === "stemmekrets"}
        onClose={() => setActiveOverlayPanel(null)}
      />
      <GrunnkretsPanel
        isOpen={activeOverlayPanel === "grunnkrets"}
        onClose={() => setActiveOverlayPanel(null)}
      />
    </>
  );
};

export default OverlayPanels;
