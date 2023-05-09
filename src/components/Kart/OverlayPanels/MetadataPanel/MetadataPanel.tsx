import styled from "styled-components";
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

const SidePanel = styled(Panel)`
  grid-area: metadata;
  max-width: 440px;
  border-radius: unset;
  margin: 0;
  border-top: none;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Divider = styled.hr`
  width: 100%;
  border: 1px solid var(--gray_light);
  margin: 0;
`;

const MetadataPanel = ({ isOpen, className }: PanelProps) => {
  const { selectedFeature, setSelectedFeature, closeOverlay } =
    useOverlayPanel();

  const showReferanser = grenseTypeWithReferanser.includes(
    selectedFeature?.get("type") as string
  );

  return (
    <SidePanel isOpen={isOpen} className={className}>
      <PanelHeader
        onClose={() => {
          setSelectedFeature(null);
          closeOverlay();
        }}
      >
        Metadata for grense
      </PanelHeader>
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
