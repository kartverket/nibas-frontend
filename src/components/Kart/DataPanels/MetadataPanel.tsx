import { useDataPanel } from "contexts/DataPanelContext";
import { Panel, PanelHeader, PanelProps } from "./Panel";
import GrenseMetadataGenerelt from "../OverlayPanels/GrensePanel/GrenseMetadataGenerelt";
import GrenseMetadataReferanser from "../OverlayPanels/GrensePanel/GrenseMetadataReferanser";

const grenseTypeWithReferanser = [
  "Territorialgrense",
  "Fylkesgrense",
  "Kommunegrense",
  "AvtaltAvgrensningslinje",
  "Riksgrense",
  "Grunnlinje",
];

const MetadataPanel = ({ isOpen, className, onClose }: PanelProps) => {
  const { selectedFeature, setSelectedFeature } = useDataPanel();

  const showReferanser = grenseTypeWithReferanser.includes(
    selectedFeature?.get("type") as string
  );

  // TODO: struktur på hvor referanser skal være
  return (
    <Panel isOpen={isOpen} className={className}>
      <PanelHeader
        onClose={() => {
          setSelectedFeature(null);
          onClose();
        }}
      >
        Metadata for grense
      </PanelHeader>
      {selectedFeature && (
        <>
          <GrenseMetadataGenerelt feature={selectedFeature} />
          {showReferanser && (
            <GrenseMetadataReferanser feature={selectedFeature} />
          )}
        </>
      )}
    </Panel>
  );
};

export default MetadataPanel;
