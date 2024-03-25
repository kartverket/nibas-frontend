import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { PanelHeader, PanelProps, SidePanel } from "../Panel";
import { Text } from "@kvib/react";
import { styled } from "styled-components";
import { useState } from "react";
import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import StepPubliser from "./StepPubliser";
import StepError from "./StepError";

type StepHeaderProps = {
  index: number;
  title: string;
  description: string;
  isActive: boolean;
  children?: React.ReactNode;
};

const StepHeaderContainer = styled.div<{ isActive: boolean }>`
  display: flex;
  flex-direction: column;
  flex-grow: ${({ isActive }) => (isActive ? "1" : "0")};
`;

const StepHeader = (props: StepHeaderProps) => {
  const maxIndex = 2;

  return (
    <StepHeaderContainer isActive={props.isActive}>
      <StepIndexTitle>
        <IndexIcon isActive={props.isActive}>{props.index}</IndexIcon>
        <div>
          <Text as="b">{props.title}</Text>
          <Text fontSize={"small"}>{props.description}</Text>
        </div>
      </StepIndexTitle>
      {props.isActive ? props.children : props.index !== maxIndex ? <StepFiller /> : <></>}
    </StepHeaderContainer>
  );
};

export const ValiderPubliserPanel = ({ isOpen, className }: PanelProps) => {
  const { closeOverlayPanel } = useOverlayPanel();

  const { utkast } = useUtkast();

  const [currentStep, setCurrentStep] = useState(1);

  return (
    <SidePanel $isOpen={isOpen} className={className}>
      <PanelHeader onClose={closeOverlayPanel}>Valider og publiser utkast</PanelHeader>

      <StepContainer>
        <StepHeader
          index={1}
          isActive={currentStep === 1}
          title="Rett opp i feil"
          description="Valider og rett opp i feil"
        >
          <StepContentContainer>
            <StepError setCurrentStep={setCurrentStep} />
          </StepContentContainer>
        </StepHeader>
        {
          // TODO Kan brukes når TS-1496 er gjort
          /* <StepHeader
          index={2}
          isActive={currentStep === 2}
          title="Tilhørighet"
          description="Sjekk at flater hører til riktig inndeling"
        >
          <StepContentContainer>
            <p>Hello</p>
            <StepButtonGroup
              secondaryButtonText="Gå tilbake feilretting"
              secondaryButtonOnClick={() => setCurrentStep(1)}
              primaryButtonText="Gå til publisering"
              primaryButtonIsLoading={false}
              primaryButtonOnClick={() => setCurrentStep(3)}
            />
          </StepContentContainer>
        </StepHeader> */
        }
        <StepHeader
          index={2}
          isActive={currentStep === 2}
          title="Publiser utkastet"
          description="Se gjennom endringene i utkastet og publiser det"
        >
          <StepContentContainer>
            {utkast && <StepPubliser utkast={utkast} setCurrentStep={setCurrentStep} />}
          </StepContentContainer>
        </StepHeader>
      </StepContainer>
    </SidePanel>
  );
};

const StepFiller = styled.div`
  height: 12px;
  margin-left: 12px;
  border-left: solid 1px;
  border-color: var(--kvib-colors-gray-200);
`;

const StepContentContainer = styled(StepFiller)`
  height: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-grow: 1;
`;

const StepContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const StepIndexTitle = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const IndexIcon = styled.div<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  border: solid 2px;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  border-color: ${({ isActive }) => (isActive ? "var(--kvib-colors-blue-500)" : "var(--kvib-colors-gray-300)")};
`;
