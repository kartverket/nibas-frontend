import GrunnkretsPanel from "./Flatedata/GrunnkretsPanel/GrunnkretsPanel";
import MergePanel from "./MergePanel/MergePanel";
import GrenseinformasjonPanel from "./GrenseinformasjonPanel/GrenseinformasjonPanel";
import StemmekretsPanel from "./Flatedata/StemmekretsPanel/StemmekretsPanel";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import KoordinaterPanel from "./KoordinaterPanel";
import { TegnforklaringPanel } from "./Tegnforklaring/TegnforklaringPanel";
import KartlagPanel from "./Kartlag/KartlagPanel";
import { SplittingPanel } from "./SplittingPanel/SplittingPanel";
import NavigasjonPanel from "./NavigasjonPanel";
import { ValiderPubliserPanel } from "./ValiderPubliserPanel/ValiderPubliserPanel";

const OverlayPanels = () => {
  const { activeOverlayPanel, activeOverlayModal } = useOverlayPanel();

  return (
    <>
      <GrenseinformasjonPanel isOpen={activeOverlayPanel === "grenseinfo"} />
      <MergePanel isOpen={activeOverlayPanel === "sammenslåing"} />
      <SplittingPanel isOpen={activeOverlayPanel === "splitting"} />
      <KoordinaterPanel isOpen={activeOverlayPanel === "koordinater"} />
      <TegnforklaringPanel isOpen={activeOverlayPanel === "tegnforklaring"} />
      <KartlagPanel isOpen={activeOverlayPanel === "kartlag"} />
      <ValiderPubliserPanel isOpen={activeOverlayPanel === "validerpubliser"} />

      <NavigasjonPanel isOpen={activeOverlayModal === "navigasjon"} />
      <GrunnkretsPanel isOpen={activeOverlayModal === "grunnkrets"} />
      <StemmekretsPanel isOpen={activeOverlayModal === "stemmekrets"} />
    </>
  );
};

export default OverlayPanels;
