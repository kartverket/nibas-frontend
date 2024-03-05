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
  const { toggleKartlag } = useKartlag();

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    toggleKartlag(mappedLayer, indexPath);
  };

  return (
    <KartlagAccordion allowToggle>
      <KartlagAccordionItem>
        <h4>
          <KartlagOuterAccordionButton $isVisible={mappedLayer.isVisible}>
            <Checkbox isChecked={mappedLayer.isVisible} onChange={handleToggle} />
            <KartlagTitle>{mappedLayer.title}</KartlagTitle>
            <Spacer />
            <ActiveKartlagOpacity layerId={mappedLayer.sourceId} />
            <KartlagAccordionIcon />
          </KartlagOuterAccordionButton>
        </h4>
        <KartlagAccordionPanel $isVisible={mappedLayer.isVisible}>
          {mappedLayer.sublayers.map((sublayer, i) =>
            sublayer.sublayers.length > 0 ? (
              <KartlagMiddle key={sublayer.id} indexPath={[...indexPath, i]} mappedLayer={sublayer} />
            ) : (
              <KartlagInner key={sublayer.id} indexPath={[...indexPath, i]} mappedLayer={sublayer} />
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

const KartlagOuterAccordionButton = styled(KartlagAccordionButton)<{ $isVisible: boolean }>`
  padding: 16px;
  background: ${(props) => (props.$isVisible ? "var(--kvib-colors-blue-50)" : "var(--kvib-colors-gray-50)")};

  &:hover {
    background: ${(props) => (props.$isVisible ? "var(--kvib-colors-blue-100)" : "var(--kvib-colors-gray-200)")};
  }
`;

const KartlagAccordionPanel = styled(AccordionPanel)<{ $isVisible: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: ${(props) => (props.$isVisible ? "var(--kvib-colors-blue-50)" : "var(--kvib-colors-gray-50)")};
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
`;

export default KartlagOuter;
