import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { PanelHeader, PanelProps, SidePanel } from "../Panel";
import { Button, Icon, Text, useDisclosure, Collapse } from "@kvib/react";
import { styled } from "styled-components";
import { useState } from "react";

type StepProps = {
  index: number;
  title: string;
  description: string;
  isActive: boolean;
  children?: React.ReactNode;
};

const Step = (props: StepProps) => {
  const Container = styled.div<{ isActive: boolean }>`
    display: flex;
    flex-direction: column;
    flex-grow: ${({ isActive }) => (isActive ? "1" : "0")};
  `;

  const maxIndex = 3;

  return (
    <Container isActive={props.isActive}>
      <StepIndexTitle>
        <IndexIcon isActive={props.isActive}>{props.index}</IndexIcon>
        <div>
          <Text as="b">{props.title}</Text>
          <Text fontSize={"small"}>{props.description}</Text>
        </div>
      </StepIndexTitle>
      {props.isActive ? props.children : props.index !== maxIndex ? <StepFiller /> : <></>}
    </Container>
  );
};

type ValidationErrorProps = {
  title: string;
  error?: Error;
};

type Error = {
  message: string;
  coordinates?: {
    north: number;
    east: number;
  };
  inndelinger?: {
    id: number;
    name: string;
    type: string;
  }[];
  code: string;
};

const ValidationError = (props: ValidationErrorProps) => {
  const { getDisclosureProps, getButtonProps, isOpen } = useDisclosure();

  const buttonProps = getButtonProps();
  const disclosureProps = getDisclosureProps();

  const [isChecked, setIsChecked] = useState(false);

  const showMoreIcon = isOpen ? "expand_less" : "expand_more";

  const errorToShow: Error = {
    code: "0361e4c4-d3bd-59e2-fd124c91bedb",
    message: "Flaten er ikke lukket",
    coordinates: {
      east: 1238182.88137711,
      north: 6666083.18758823,
    },
    inndelinger: [
      { id: 3316, name: "Modum", type: "Kommune" },
      { id: 33050601, name: "Stigsrud", type: "Grunnkrets" },
      { id: 33160402, name: "Øderud", type: "Grunnkrets" },
    ],
  };

  return (
    <ErrorContent>
      <ErrorInformation>
        <Icon
          icon="error"
          isFilled
          color={isChecked ? "var(--kvib-colors-blue-500" : "var(--kvib-colors-red-500)"}
        ></Icon>
        <div>
          <Text as="b">{props.title}</Text>
          {/* eslint-disable-next-line @typescript-eslint/strict-boolean-expressions*/}
          {errorToShow && (
            <ShowMoreButton
              isChecked={isChecked}
              size="xs"
              variant="tertiary"
              rightIcon={showMoreIcon}
              {...buttonProps}
            >
              Vis mer informasjon
            </ShowMoreButton>
          )}
        </div>
        <Button size="xs" variant="ghost" onClick={() => setIsChecked(true)}>
          Gå til grensen
        </Button>
      </ErrorInformation>
      {/* eslint-disable-next-line @typescript-eslint/strict-boolean-expressions*/}
      {errorToShow && (
        <Collapse in={isOpen}>
          <ErrorExtraInformation {...disclosureProps}>
            <div>
              <Text as="b" fontSize={"small"}>
                Feilmelding
              </Text>
              <Text fontSize={"small"}>{errorToShow.message}</Text>
            </div>
            {errorToShow.coordinates && (
              <div>
                <Text as="b" fontSize={"small"}>
                  Koordinater
                </Text>
                <Text fontSize={"small"}>{errorToShow.coordinates.north}N</Text>
                <Text fontSize={"small"}>{errorToShow.coordinates.east}Ø</Text>
              </div>
            )}
            {errorToShow.inndelinger && (
              <div>
                <Text as="b" fontSize={"small"}>
                  Inndelinger
                </Text>
                {errorToShow.inndelinger.map((inndeling) => {
                  return (
                    <Text key={inndeling.id} fontSize={"small"}>
                      {`${inndeling.id} ${inndeling.name} (${inndeling.type})`}
                    </Text>
                  );
                })}
              </div>
            )}
            <div>
              <Text as="b" fontSize={"small"}>
                Feilkode
              </Text>
              <Text fontSize={"small"}>{errorToShow.code}</Text>
            </div>
          </ErrorExtraInformation>
        </Collapse>
      )}
    </ErrorContent>
  );
};

type StepButtonGroupProps = {
  secondaryButtonText: string;
  secondaryButtonOnClick: () => void;
  primaryButtonText: string;
  primaryButtonOnClick: () => void;
};
const StepButtonGroup = (props: StepButtonGroupProps) => {
  return (
    <ButtonGroup>
      <Button variant="secondary" onClick={props.secondaryButtonOnClick}>
        {props.secondaryButtonText}
      </Button>
      <Button variant="primary" onClick={props.primaryButtonOnClick}>
        {props.primaryButtonText}
      </Button>
    </ButtonGroup>
  );
};

export const ValiderPubliserPanel = ({ isOpen, className }: PanelProps) => {
  const { closeOverlayPanel } = useOverlayPanel();

  const [currentStep, setCurrentStep] = useState(1);

  return (
    <SidePanel $isOpen={isOpen} className={className}>
      <PanelHeader onClose={closeOverlayPanel}>Valider og publiser utkast</PanelHeader>

      <StepContainer>
        <Step index={1} isActive={currentStep === 1} title="Rett opp i feil" description="Valider og rett opp i feil">
          <StepContentContainer>
            <ErrorContainer>
              <ValidationError title="Grense krysser annen grense"></ValidationError>
              <ValidationError title="Grense mangler tilhørighet"></ValidationError>
            </ErrorContainer>
            <StepButtonGroup
              secondaryButtonText="Gå tilbake til redigering"
              secondaryButtonOnClick={closeOverlayPanel}
              primaryButtonText="Valider og gå videre"
              primaryButtonOnClick={() => setCurrentStep(2)}
            />
          </StepContentContainer>
        </Step>
        <Step
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
              primaryButtonOnClick={() => setCurrentStep(3)}
            />
          </StepContentContainer>
        </Step>
        <Step
          index={3}
          isActive={currentStep === 3}
          title="Publiser utkastet"
          description="Se gjennom endringene i utkastet og publiser det"
        >
          <StepContentContainer>
            <p>Yep</p>
            <StepButtonGroup
              secondaryButtonText="Gå tilbake tilhørighet"
              secondaryButtonOnClick={() => setCurrentStep(2)}
              primaryButtonText="Publiser utkast"
              primaryButtonOnClick={() => {}}
            />
          </StepContentContainer>
        </Step>
      </StepContainer>
    </SidePanel>
  );
};

const ShowMoreButton = styled(Button)`
  padding: 0px;
`;

const ButtonGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin-top: 8px;
  gap: 16px;
`;

const ErrorContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 18px;
  border: solid 1px;
  border-color: var(--kvib-colors-gray-200);
  border-radius: 8px;
`;

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

const ErrorInformation = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-rows: 1fr;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`;

const ErrorExtraInformation = styled.div`
  border-left: solid 2px;
  border-color: var(--kvib-colors-red-500);
  margin-left: 12px;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
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
