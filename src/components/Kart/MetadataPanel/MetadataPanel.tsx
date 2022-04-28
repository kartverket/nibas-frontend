import styled from "styled-components";
import { KartInteractable } from "../KartInteractable";
import MetadataContent from "./MetadataContent";
import Button from "components/form/Button";
import { useMetadataPanel } from "contexts/MetadataPanelContext";

const MetadataPanel = () => {
  const { panelContent, panelData, closePanel } = useMetadataPanel();

  // kun vis metadata hvis én feature er selected
  // det gir ikke mening å vise metadata for flere på en gang
  if (panelContent !== "grensemetadata") return null;

  return (
    <Panel>
      <h3>Linje metadata</h3>
      <MetadataContent key={panelData.getId()} feature={panelData} />
      <Button onClick={closePanel}>Lukk</Button>
    </Panel>
  );
};

const Panel = styled(KartInteractable)`
  grid-area: metadata;
  border: 1px solid ${({ theme }) => theme.colors.grayLight};
  padding: 16px;
  overflow: auto;
  max-height: 500px;
  border-radius: 3px;

  > h3 {
    margin-top: 0;
    margin-bottom: 16px;
  }
`;

export default MetadataPanel;
