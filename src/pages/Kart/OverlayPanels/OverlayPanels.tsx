import MergePanel from "./MergePanel/MergePanel";
import GrenseinformasjonPanel from "./GrenseinformasjonPanel/GrenseinformasjonPanel";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import FlyttKoordinaterPanel from "./FlyttKoordinaterPanel";
import { TegnforklaringPanel } from "./Tegnforklaring/TegnforklaringPanel";
import KartlagPanel from "./Kartlag/KartlagPanel";
import { SplittingPanel } from "./SplittingPanel/SplittingPanel";
import InndelingerPanel from "./Inndelinger/InndelingerPanel";
import NavigasjonPanel from "./NavigasjonPanel/NavigasjonPanel";
import FlatedataPanel from "./FlatedataPanel/FlatedataPanel";

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

      <InndelingerPanel isOpen={activeOverlayModal === "inndelinger" || activeOverlayModal === "inndelinger-view"} />
      <NavigasjonPanel isOpen={activeOverlayModal === "navigasjon"} />
      <FlatedataPanel isOpen={activeOverlayModal === "flatedata"} />
    </>
  );
};

export default OverlayPanels;
