import { styled, css } from "styled-components";
import { Accordion, AccordionPanel } from "@kvib/react";
import { MappedLayer } from "utils/getLayersFromWMS";
import KartlagInner from "./KartlagInner";
import {
  KartlagAccordionItem,
  KartlagAccordionButton,
  KartlagAccordionIcon,
} from "./components";

type Props = {
  mappedLayer: MappedLayer;
  isNested?: boolean;
};

// Obs! Denne komponenten kan være nøstet i seg selv dersom det er flere underlag
const KartlagMiddle = ({ mappedLayer, isNested = false }: Props) => {
  return (
    <Accordion allowToggle>
      <KartlagAccordionItem>
        <KartlagAccordionButton>
          <span>{mappedLayer.title}</span>
          <KartlagAccordionIcon />
        </KartlagAccordionButton>
        <KartlagAccordionPanel $isNested={isNested}>
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
        </KartlagAccordionPanel>
      </KartlagAccordionItem>
    </Accordion>
  );
};

const KartlagAccordionPanel = styled(AccordionPanel)<{ $isNested: boolean }>`
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
