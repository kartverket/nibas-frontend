import GrunnkretsPanel from "./Flatedata/GrunnkretsPanel/GrunnkretsPanel";
import MergePanel from "./MergePanel/MergePanel";
import GrenseinformasjonPanel from "./GrenseinformasjonPanel/GrenseinformasjonPanel";
import StemmekretsPanel from "./Flatedata/StemmekretsPanel/StemmekretsPanel";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import FlyttKoordinaterPanel from "./FlyttKoordinaterPanel";
import { TegnforklaringPanel } from "./Tegnforklaring/TegnforklaringPanel";
import KartlagPanel from "./Kartlag/KartlagPanel";
import { SplittingPanel } from "./SplittingPanel/SplittingPanel";
import NavigasjonPanel from "./NavigasjonPanel/NavigasjonPanel";

const OverlayPanels = () => {
  const { activeOverlayPanel, activeOverlayModal } = useOverlayPanel();

  return (
    <>
      <GrenseinformasjonPanel isOpen={activeOverlayPanel === "grenseinfo"} />
      <MergePanel isOpen={activeOverlayPanel === "sammenslåing"} />
      <SplittingPanel isOpen={activeOverlayPanel === "splitting"} />
      <FlyttKoordinaterPanel isOpen={activeOverlayPanel === "koordinater"} />
      <TegnforklaringPanel isOpen={activeOverlayPanel === "tegnforklaring"} />
      <KartlagPanel isOpen={activeOverlayPanel === "kartlag"} />

      <NavigasjonPanel isOpen={activeOverlayModal === "navigasjon"} />
      <GrunnkretsPanel isOpen={activeOverlayModal === "grunnkrets"} />
      <StemmekretsPanel isOpen={activeOverlayModal === "stemmekrets"} />
    </>
  );
};

export default OverlayPanels;
