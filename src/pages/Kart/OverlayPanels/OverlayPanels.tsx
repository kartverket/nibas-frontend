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
  return (
    <>
      <OverlayPanel />
      <OverlayModal />
    </>
  );
};

const OverlayPanel = () => {
  const { activeOverlayPanel } = useOverlayPanel();

  switch (activeOverlayPanel) {
    case null: {
      return null;
    }
    case "grenseinfo": {
      return <GrenseinformasjonPanel />;
    }
    case "sammenslåing": {
      return <MergePanel />;
    }
    case "splitting": {
      return <SplittingPanel />;
    }
    case "tegnforklaring": {
      return <TegnforklaringPanel />;
    }
    case "koordinater": {
      return <FlyttKoordinaterPanel />;
    }
    case "kartlag": {
      return <KartlagPanel />;
    }
  }
};

const OverlayModal = () => {
  const { activeOverlayModal } = useOverlayPanel();

  switch (activeOverlayModal) {
    case null: {
      return null;
    }
    case "inndelinger":
    case "inndelinger-view": {
      return <InndelingerPanel />;
    }
    case "flatedata": {
      return <FlatedataPanel />;
    }
    case "navigasjon": {
      return <NavigasjonPanel />;
    }
  }
};

export default OverlayPanels;
