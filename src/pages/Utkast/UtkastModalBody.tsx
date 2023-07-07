import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  ModalBody,
} from "@kvib/react";
import styled from "styled-components";

const UtkastModalBody = ({ type }: { type: "Publiser" | "Slett" | null }) => {
  return (
    <Container>
      {type === "Publiser" ? (
        <Alert status="info">
          <AlertIcon />
          <div>
            <AlertTitle>Du er i ferd med å publisere et utkast</AlertTitle>
            <AlertDescription>
              Endringene i utkastet vil bli tilgjengelig for alle etter
              publisering.
            </AlertDescription>
          </div>
        </Alert>
      ) : (
        <Alert status="warning">
          <AlertIcon />
          <div>
            <AlertTitle>
              Ved å slette utkastet mister du alle endringene som er gjort i
              utkastet.
            </AlertTitle>
            <AlertDescription>
              Denne handlingen kan ikke angres.
            </AlertDescription>
          </div>
        </Alert>
      )}
      <Accordion allowToggle defaultIndex={[0]}>
        <EndringsloggAccordionItem>
          <AccordionToggle>
            Endringer i dette utkastet
            <AccordionIcon />
          </AccordionToggle>
          <AccordionPanel>TODO: Endringslogg kommer her</AccordionPanel>
        </EndringsloggAccordionItem>
      </Accordion>
    </Container>
  );
};

const Container = styled(ModalBody)`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const EndringsloggAccordionItem = styled(AccordionItem)`
  border: none;
  box-shadow: var(--kvib-shadows-base);
  border-radius: 8px;
`;

const AccordionToggle = styled(AccordionButton)`
  display: flex;
  justify-content: space-between;
  font-weight: var(--kvib-fontWeights-bold);
`;

export default UtkastModalBody;
