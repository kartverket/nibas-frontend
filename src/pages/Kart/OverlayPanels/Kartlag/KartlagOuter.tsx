import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
} from "@kvib/react";
import styled from "styled-components";
import { MappedLayer } from "utils/getLayersFromWMS";
import KartlagMiddle from "./KartlagMiddle";
import KartlagInner from "./KartlagInner";

type Props = {
  mappedLayer: MappedLayer;
};

const KartlagOuter = ({ mappedLayer }: Props) => {
  return (
    <Accordion allowToggle>
      <Folder>
        <FolderButton>
          <span>{mappedLayer.title}</span>
          <FolderIcon />
        </FolderButton>
        <FolderContent>
          {mappedLayer.layers.map((subLayer) =>
            subLayer.layers.length > 0 ? (
              <KartlagMiddle key={subLayer.id} mappedLayer={subLayer} />
            ) : (
              <KartlagInner key={subLayer.id} mappedLayer={subLayer} />
            )
          )}
        </FolderContent>
      </Folder>
    </Accordion>
  );
};

// TODO: trekk ut som felleskomponenter siden mye overlapper med middle her
const Folder = styled(AccordionItem)`
  border: none;
`;

const FolderButton = styled(AccordionButton)`
  display: flex;
  justify-content: space-between;
  padding: 8px 16px;

  &[aria-expanded="true"] {
    font-weight: var(--kvib-fontWeights-bold);
    background: var(--kvib-colors-gray-50);
  }
`;

const FolderIcon = styled(AccordionIcon)`
  width: 40px;
  height: 40px;
  padding: 8px;
`;

const FolderContent = styled(AccordionPanel)`
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--kvib-colors-gray-50);
`;

export default KartlagOuter;
