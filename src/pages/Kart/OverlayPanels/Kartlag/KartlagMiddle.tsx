import { styled } from "styled-components";
import { Accordion, AccordionPanel, Checkbox, Spacer } from "@kvib/react";
import KartlagInner from "./KartlagInner";
import { KartlagAccordionItem, KartlagAccordionButton, KartlagAccordionIcon } from "./components";
import { MappedLayer, useKartlag } from "contexts/KartlagContext/KartlagContext";

type Props = {
  indexPath: number[];
  mappedLayer: MappedLayer;
  isNested?: boolean;
};

// Obs! Denne komponenten kan være nøstet i seg selv dersom det er flere underlag
const KartlagMiddle = ({ mappedLayer, indexPath, isNested = false }: Props) => {
  const { toggleLayer } = useKartlag();
  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    // TODO: denne (eller noe relatert) er wack av og til når man toggler av, kan være re-rendringsproblemer
    e.stopPropagation();
    toggleLayer(mappedLayer, indexPath);
  };
  return (
    <Accordion allowToggle>
      <KartlagAccordionItem>
        <KartlagMiddleAccordionButton $isVisible={mappedLayer.isVisible}>
          <Checkbox isChecked={mappedLayer.isVisible} onChange={handleToggle} />
          <KartlagTitle>{mappedLayer.title}</KartlagTitle>
          <Spacer />
          <KartlagAccordionIcon />
        </KartlagMiddleAccordionButton>
        <KartlagAccordionPanel $isNested={isNested}>
          {mappedLayer.layers.map((subLayer, i) =>
            subLayer.layers.length > 0 ? (
              <KartlagMiddle key={subLayer.id} indexPath={[...indexPath, i]} mappedLayer={subLayer} />
            ) : (
              <KartlagInner key={subLayer.id} indexPath={[...indexPath, i]} mappedLayer={subLayer} />
            ),
          )}
        </KartlagAccordionPanel>
      </KartlagAccordionItem>
    </Accordion>
  );
};

const KartlagMiddleAccordionButton = styled(KartlagAccordionButton)<{ $isVisible: boolean }>`
  &:hover {
    background: ${(props) => (props.$isVisible ? "var(--kvib-colors-blue-100)" : "var(--kvib-colors-gray-200)")};
  }
`;

const KartlagTitle = styled.span`
  margin-left: 8px;
`;

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
