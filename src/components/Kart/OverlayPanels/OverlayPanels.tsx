import GrunnkretsPanel from "./GrunnkretsPanel/GrunnkretsPanel";
import MetadataPanel from "./MetadataPanel/MetadataPanel";
import StemmekretsPanel from "./StemmekretsPanel/StemmekretsPanel";
import { useOverlayPanel } from "contexts/OverlayPanelContext";

const OverlayPanels = () => {
  const { activeOverlayPanel } = useOverlayPanel();

  return (
    <>
      <MetadataPanel isOpen={activeOverlayPanel === "metadata"} />
      <StemmekretsPanel isOpen={activeOverlayPanel === "stemmekrets"} />
      <GrunnkretsPanel isOpen={activeOverlayPanel === "grunnkrets"} />
    </>
  );
};

export default OverlayPanels;
