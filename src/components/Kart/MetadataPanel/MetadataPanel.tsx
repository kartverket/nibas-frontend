import styled from "styled-components";
import { KartInteractable } from "../KartInteractable";
import GrensePanel from "./GrensePanel";
import Button from "components/form/Button";
import { useMetadataPanel } from "contexts/MetadataPanelContext";

const MetadataPanel = () => {
  const { panelContext, closePanel } = useMetadataPanel();

  if (!panelContext) return null;

  return (
    <Panel>
      {panelContext.content === "grensemetadata" && (
        <GrensePanel data={panelContext.data} />
      )}
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

  @media (min-width: ${({ theme }) => theme.dimensions.lgPx}) {
    max-height: 800px;
  }

  > h3 {
    margin-top: 0;
    margin-bottom: 16px;
  }
`;

export default MetadataPanel;
