import GrunnkretsPanel from "./Flatedata/GrunnkretsPanel/GrunnkretsPanel";
import MergePanel from "./MergePanel/MergePanel";
import MetadataPanel from "./MetadataPanel/MetadataPanel";
import StemmekretsPanel from "./Flatedata/StemmekretsPanel/StemmekretsPanel";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import KoordinaterPanel from "./KoordinaterPanel";
import { TegnforklaringPanel } from "./Tegnforklaring/TegnforklaringPanel";
import KartlagPanel from "./Kartlag/KartlagPanel";
import InndelingerPanel from "./Inndelinger/InndelingerPanel";

const OverlayPanels = () => {
  const { activeOverlayPanel, activeOverlayModal } = useOverlayPanel();

  return (
    <>
      <MetadataPanel isOpen={activeOverlayPanel === "metadata"} />
      <MergePanel isOpen={activeOverlayPanel === "sammenslåing"} />
      <KoordinaterPanel isOpen={activeOverlayPanel === "koordinater"} />
      <TegnforklaringPanel isOpen={activeOverlayPanel === "tegnforklaring"} />
      <KartlagPanel isOpen={activeOverlayPanel === "kartlag"} />

      <InndelingerPanel
        isOpen={
          activeOverlayModal === "inndelinger-redigering" ||
          activeOverlayModal === "inndelinger-visning"
        }
      />
      <GrunnkretsPanel isOpen={activeOverlayModal === "grunnkrets"} />
      <StemmekretsPanel isOpen={activeOverlayModal === "stemmekrets"} />
    </>
  );
};

export default OverlayPanels;
