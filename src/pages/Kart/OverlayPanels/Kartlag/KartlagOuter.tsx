import { styled } from "styled-components";
import { Accordion, AccordionPanel, Spacer } from "@kvib/react";
import { MappedLayer } from "utils/getLayersFromWMS";
import KartlagMiddle from "./KartlagMiddle";
import KartlagInner from "./KartlagInner";
import { KartlagAccordionItem, KartlagAccordionButton, KartlagAccordionIcon } from "./components";
import ActiveKartlagOpacity from "./KartlagOpacity";

type Props = {
  mappedLayer: MappedLayer;
};

const KartlagOuter = ({ mappedLayer }: Props) => {
  return (
    <KartlagAccordion allowToggle>
      <KartlagAccordionItem>
        <KartlagOuterAccordionButton>
          <span>{mappedLayer.title}</span>
          <Spacer />
          <ActiveKartlagOpacity layerId={mappedLayer.sourceId} />
          <KartlagAccordionIcon />
        </KartlagOuterAccordionButton>
        <KartlagAccordionPanel>
          {mappedLayer.layers.map((subLayer) =>
            subLayer.layers.length > 0 ? (
              <KartlagMiddle key={subLayer.id} mappedLayer={subLayer} />
            ) : (
              <KartlagInner key={subLayer.id} mappedLayer={subLayer} />
            ),
          )}
        </KartlagAccordionPanel>
      </KartlagAccordionItem>
    </KartlagAccordion>
  );
};

const KartlagAccordion = styled(Accordion)`
  width: 100%;
`;

const KartlagOuterAccordionButton = styled(KartlagAccordionButton)`
  padding: 16px;
  background: var(--kvib-colors-gray-50);
`;

const KartlagAccordionPanel = styled(AccordionPanel)`
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--kvib-colors-gray-50);
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
`;

export default KartlagOuter;
