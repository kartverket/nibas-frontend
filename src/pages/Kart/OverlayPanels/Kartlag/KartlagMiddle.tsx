import { styled } from "styled-components";
import { Accordion, AccordionPanel, Checkbox, Spacer } from "@kvib/react";
import KartlagInner from "./KartlagInner";
import { KartlagAccordionItem, KartlagAccordionIcon, KartlagControls, KartlagAccordionButton } from "./components";
import { MappedLayer, useKartlag } from "contexts/KartlagContext/KartlagContext";

type Props = {
  indexPath: number[];
  mappedLayer: MappedLayer;
  isNested?: boolean;
};

// Obs! Denne komponenten kan være nøstet i seg selv dersom det er flere underlag
const KartlagMiddle = ({ mappedLayer, indexPath, isNested = false }: Props) => {
  const { toggleKartlag } = useKartlag();

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    toggleKartlag(mappedLayer, indexPath);
  };
  return (
    <Accordion allowToggle>
      <KartlagAccordionItem>
        {({ isExpanded }) => (
          <>
            <KartlagControls $isExpanded={isExpanded}>
              <Checkbox isChecked={mappedLayer.isVisible} onChange={handleToggle}>
                {mappedLayer.title}
              </Checkbox>
              <Spacer />
              <KartlagAccordionButton $isVisible={mappedLayer.isVisible}>
                <KartlagAccordionIcon />
              </KartlagAccordionButton>
            </KartlagControls>
            <KartlagAccordionPanel $isNested={isNested}>
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
    </Accordion>
  );
};

const KartlagAccordionPanel = styled(AccordionPanel)`
  position: relative;
  padding: 0;

  padding-left: 24px;
  padding-bottom: 24px;
  &::before {
    position: absolute;
    top: 0;
    left: 24px;

    display: block;
    content: "";
    height: calc(100% - 24px);
    width: 2px;
    background: var(--kvib-colors-chakra-border-color);
  }
`;

export default KartlagMiddle;
