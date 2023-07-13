import GrunnkretsPanel from "./Flatedata/GrunnkretsPanel/GrunnkretsPanel";
import MergePanel from "./MergePanel/MergePanel";
import MetadataPanel from "./MetadataPanel/MetadataPanel";
import StemmekretsPanel from "./Flatedata/StemmekretsPanel/StemmekretsPanel";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import KoordinaterPanel from "./KoordinaterPanel";
import { TegnforklaringPanel } from "./Tegnforklaring/TegnforklaringPanel";

const OverlayPanels = () => {
  const { activeOverlayPanel } = useOverlayPanel();

  return (
    <>
      <StemmekretsPanel isOpen={activeOverlayPanel === "stemmekrets"} />
      <GrunnkretsPanel isOpen={activeOverlayPanel === "grunnkrets"} />
      <MetadataPanel isOpen={activeOverlayPanel === "metadata"} />
      <MergePanel isOpen={activeOverlayPanel === "sammenslåing"} />
      <KoordinaterPanel isOpen={activeOverlayPanel === "koordinater"} />
      <TegnforklaringPanel isOpen={activeOverlayPanel === "tegnforklaring"} />
    </>
  );
};

export default OverlayPanels;
