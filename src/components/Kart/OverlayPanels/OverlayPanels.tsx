import GrunnkretsPanel from "./GrunnkretsPanel/GrunnkretsPanel";
import MetaOverlayPanel from "./MetadataPanel/MetadataPanel";
import StemmekretsPanel from "./StemmekretsPanel";
import { useOverlayPanel } from "contexts/OverlayPanelContext";

// TODO: her vi bør bruke contexten for å avgjøre om noe skal vises eller ikke
// viktig at noe ikke unmountes, bare skjules med css? for at state skal beholdes altså
// mulig vi bare må mellomlagre state i context elns hvis det blir uu-problemer med tabbing osv

// TODO: rename til OverlayPanels
const OverlayPanels = () => {
  const { activeOverlayPanel, setActiveOverlayPanel } = useOverlayPanel();

  // TODO: vurder om vi bare skal ha en panel-wrapper her, så kan hver av komponentene bare være innholdet med en fragment
  return (
    <>
      <MetaOverlayPanel
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
