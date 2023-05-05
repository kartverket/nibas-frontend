import MetadataPanel from "./MetadataPanel";
import StemmekretsPanel from "./StemmekretsPanel";
import GrunnkretsPanel from "./GrunnkretsPanel";
import { useDataPanel } from "contexts/DataPanelContext";

// TODO: her vi bør bruke contexten for å avgjøre om noe skal vises eller ikke
// viktig at noe ikke unmountes, bare skjules med css? for at state skal beholdes altså
// mulig vi bare må mellomlagre state i context elns hvis det blir uu-problemer med tabbing osv

// TODO: rename til OverlayPanels
const DataPanels = () => {
  const { activeDataPanel, setActiveDataPanel } = useDataPanel();

  // TODO: vurder om vi bare skal ha en panel-wrapper her, så kan hver av komponentene bare være innholdet med en fragment
  return (
    <>
      <MetadataPanel
        isOpen={activeDataPanel === "metadata"}
        onClose={() => setActiveDataPanel(null)}
      />
      <StemmekretsPanel
        isOpen={activeDataPanel === "stemmekrets"}
        onClose={() => setActiveDataPanel(null)}
      />
      <GrunnkretsPanel
        isOpen={activeDataPanel === "grunnkrets"}
        onClose={() => setActiveDataPanel(null)}
      />
    </>
  );
};

export default DataPanels;
