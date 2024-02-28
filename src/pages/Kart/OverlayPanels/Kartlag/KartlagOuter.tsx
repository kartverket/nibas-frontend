import { styled } from "styled-components";
import { Accordion, AccordionPanel, Checkbox, Spacer } from "@kvib/react";
import KartlagMiddle from "./KartlagMiddle";
import KartlagInner from "./KartlagInner";
import { KartlagAccordionItem, KartlagAccordionButton, KartlagAccordionIcon } from "./components";
import ActiveKartlagOpacity from "./KartlagOpacity";
import { MappedLayer, useKartlag } from "contexts/KartlagContext/KartlagContext";

type Props = {
  indexPath: number[];
  mappedLayer: MappedLayer;
};

const KartlagOuter = ({ indexPath, mappedLayer }: Props) => {
  const { toggleLayer } = useKartlag();
  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    // TODO: denne (eller noe relatert) er wack av og til når man toggler av, kan være re-rendringsproblemer
    e.stopPropagation();
    toggleLayer(mappedLayer, indexPath);
    // TODO: åpne accordion når man har togglet på? lukk når man har togglet av? samme gjelder kartlagmiddle
  };
  return (
    <KartlagAccordion allowToggle>
      <KartlagAccordionItem>
        <KartlagOuterAccordionButton>
          <Checkbox isChecked={mappedLayer.isVisible} onChange={handleToggle} />
          <KartlagTitle>{mappedLayer.title}</KartlagTitle>
          <Spacer />
          <ActiveKartlagOpacity layerId={mappedLayer.sourceId} />
          <KartlagAccordionIcon />
        </KartlagOuterAccordionButton>
        <KartlagAccordionPanel>
          {mappedLayer.layers.map((subLayer, i) =>
            subLayer.layers.length > 0 ? (
              <KartlagMiddle key={subLayer.id} indexPath={[...indexPath, i]} mappedLayer={subLayer} />
            ) : (
              <KartlagInner key={subLayer.id} indexPath={[...indexPath, i]} mappedLayer={subLayer} />
            ),
          )}
        </KartlagAccordionPanel>
      </KartlagAccordionItem>
    </KartlagAccordion>
  );
};

const KartlagTitle = styled.span`
  margin-left: 8px;
`;

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
