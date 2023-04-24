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
  const { selectedMetadata } = useDataPanel();

  const showReferanser = grenseTypeWithReferanser.includes(
    selectedMetadata?.get("type") as string
  );

  return (
    <Panel isOpen={isOpen} className={className}>
      <PanelHeader onClose={onClose}>Metadata for grense</PanelHeader>
      {selectedMetadata && (
        <>
          <GrenseMetadataGenerelt feature={selectedMetadata} />
          {showReferanser && (
            <GrenseMetadataReferanser feature={selectedMetadata} />
          )}
        </>
      )}
    </Panel>
  );
};

export default MetadataPanel;
