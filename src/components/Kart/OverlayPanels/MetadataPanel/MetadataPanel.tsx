import styled from "styled-components";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { PanelHeader, PanelProps, SidePanel } from "../Panel";
import MetadataGenerelt from "./MetadataGenerelt";
import MetadataReferanser from "./MetadataReferanser";
import { Divider } from "components/Divider";

const grenseTypeWithReferanser = [
  "Territorialgrense",
  "Fylkesgrense",
  "Kommunegrense",
  "AvtaltAvgrensningslinje",
  "Riksgrense",
  "Grunnlinje",
];

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MetadataPanel = ({ isOpen, className }: PanelProps) => {
  const { selectedFeature, closeOverlayPanel } = useOverlayPanel();

  const showReferanser = grenseTypeWithReferanser.includes(
    selectedFeature?.get("type") as string
  );

  return (
    <SidePanel isOpen={isOpen} className={className}>
      <PanelHeader onClose={closeOverlayPanel}>Metadata for grense</PanelHeader>
      {selectedFeature && (
        <Content>
          <MetadataGenerelt feature={selectedFeature} />
          {showReferanser && (
            <>
              <Divider />
              <MetadataReferanser feature={selectedFeature} />
            </>
          )}
        </Content>
      )}
    </SidePanel>
  );
};

export default MetadataPanel;
