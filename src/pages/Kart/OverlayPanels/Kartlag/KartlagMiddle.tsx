import styled, { css } from "styled-components";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
} from "@kvib/react";
import { MappedLayer } from "utils/getLayersFromWMS";
import KartlagInner from "./KartlagInner";

type Props = {
  mappedLayer: MappedLayer;
  isNested?: boolean;
};

// Obs! Denne komponenten kan være nøstet i seg selv dersom det er flere underlag
const KartlagMiddle = ({ mappedLayer, isNested }: Props) => {
  return (
    <Accordion allowToggle>
      <Folder>
        <FolderButton>
          <span>{mappedLayer.title}</span>
          <FolderIcon />
        </FolderButton>
        <FolderContent $isNested={isNested}>
          {mappedLayer.layers.map((subLayer) =>
            subLayer.layers.length > 0 ? (
              <KartlagMiddle
                key={subLayer.id}
                mappedLayer={subLayer}
                isNested
              />
            ) : (
              <KartlagInner key={subLayer.id} mappedLayer={subLayer} />
            )
          )}
        </FolderContent>
      </Folder>
    </Accordion>
  );
};

const Folder = styled(AccordionItem)`
  background: var(--kvib-colors-chakra-body-bg);
  border: none;
`;

const FolderButton = styled(AccordionButton)`
  display: flex;
  justify-content: space-between;
  padding: 8px 16px;

  &[aria-expanded="true"] {
    font-weight: var(--kvib-fontWeights-bold);
  }
`;

const FolderIcon = styled(AccordionIcon)`
  width: 40px;
  height: 40px;
  padding: 8px;
`;

const FolderContent = styled(AccordionPanel)<{ $isNested: boolean }>`
  position: relative;
  padding: 0;
  padding-left: 16px;

  ${(props) =>
    props.$isNested &&
    css`
      &::before {
        position: absolute;
        top: 0;
        left: 16px;
        display: block;
        content: "";
        height: 100%;
        width: 1px;
        background: var(--kvib-colors-chakra-border-color);
      }
    `};
`;

export default KartlagMiddle;
