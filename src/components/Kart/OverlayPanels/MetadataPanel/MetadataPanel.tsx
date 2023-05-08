import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { Panel, PanelHeader, PanelProps } from "../Panel";
import MetadataGenerelt from "./MetadataGenerelt";
import MetadataReferanser from "./MetadataReferanser";

const grenseTypeWithReferanser = [
  "Territorialgrense",
  "Fylkesgrense",
  "Kommunegrense",
  "AvtaltAvgrensningslinje",
  "Riksgrense",
  "Grunnlinje",
];

const MetaOverlayPanel = ({ isOpen, className, onClose }: PanelProps) => {
  const { selectedFeature, setSelectedFeature } = useOverlayPanel();

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
          <MetadataGenerelt feature={selectedFeature} />
          {showReferanser && <MetadataReferanser feature={selectedFeature} />}
        </>
      )}
    </Panel>
  );
};

export default MetaOverlayPanel;
