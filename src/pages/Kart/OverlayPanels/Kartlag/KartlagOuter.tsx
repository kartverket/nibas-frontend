import { styled } from "styled-components";
import { Accordion, AccordionItemContent, Checkbox, Spacer } from "@kvib/react";
import KartlagMiddle from "./KartlagMiddle";
import KartlagInner from "./KartlagInner";
import { KartlagAccordionItem, KartlagAccordionIcon, KartlagControls, KartlagAccordionButton } from "./components";
import KartlagOpacity from "./KartlagOpacity";
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
    <KartlagAccordion collapsible>
      <KartlagAccordionItem>
        {({ isExpanded }) => (
          <>
            <KartlagOuterControls $isVisible={mappedLayer.isVisible} $isExpanded={isExpanded}>
              <Checkbox isChecked={mappedLayer.isVisible} onChange={handleToggle}>
                {mappedLayer.title}
              </Checkbox>
              <Spacer />
              <KartlagOpacity layerId={mappedLayer.sourceId} />
              <KartlagAccordionButton $isVisible={mappedLayer.isVisible}>
                <KartlagAccordionIcon />
              </KartlagAccordionButton>
            </KartlagOuterControls>
            <KartlagAccordionPanel $isVisible={mappedLayer.isVisible}>
              {mappedLayer.sublayers.map((sublayer, i) =>
                sublayer.sublayers.length > 0 ? (
                  <KartlagMiddle key={sublayer.id} indexPath={[...indexPath, i]} mappedLayer={sublayer} />
                ) : (
                  <KartlagInner key={sublayer.id} indexPath={[...indexPath, i]} mappedLayer={sublayer} />
                ),
              )}
            </KartlagAccordionPanel>
          </>
        )}
      </KartlagAccordionItem>
    </KartlagAccordion>
  );
};

const KartlagAccordion = styled(Accordion)`
  width: 100%;
`;

const KartlagOuterControls = styled(KartlagControls)<{ $isVisible: boolean }>`
  padding: 16px;
  background: ${(props) => (props.$isVisible ? "var(--kvib-colors-blue-50)" : "var(--kvib-colors-gray-50)")};
`;

const KartlagAccordionPanel = styled(AccordionItemContent)<{ $isVisible: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: ${(props) => (props.$isVisible ? "var(--kvib-colors-blue-50)" : "var(--kvib-colors-gray-50)")};
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
`;

export default KartlagOuter;
