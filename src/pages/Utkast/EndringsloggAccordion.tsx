import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
} from "@kvib/react";
import styled from "styled-components";

const EndringsloggAccordion = () => {
  return (
    <Accordion allowToggle defaultIndex={[0]}>
      <EndringsloggAccordionItem>
        <EndringsloggAccordionButton>
          Endringer i dette utkastet
          <AccordionIcon />
        </EndringsloggAccordionButton>
        <AccordionPanel>TODO: Endringslogg kommer her</AccordionPanel>
      </EndringsloggAccordionItem>
    </Accordion>
  );
};

const EndringsloggAccordionItem = styled(AccordionItem)`
  border: none;
  box-shadow: var(--kvib-shadows-base);
  border-radius: 8px;
`;

const EndringsloggAccordionButton = styled(AccordionButton)`
  display: flex;
  justify-content: space-between;
  font-weight: var(--kvib-fontWeights-bold);
`;

export default EndringsloggAccordion;
