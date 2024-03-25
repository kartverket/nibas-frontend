import { useDisclosure, Icon, Button, Collapse, Text, useClipboard, IconButton, Tooltip } from "@kvib/react";
import { useState } from "react";
import { styled } from "styled-components";
import StepButtonGroup from "./StepButtonGroup";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { map } from "pages/Kart/constants";
import { Coordinate } from "ol/coordinate";

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
  const { onCopy, setValue, hasCopied } = useClipboard("");

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

  const getCoordinateFromErrorCoordinate = (): Coordinate | undefined => {
    if (errorToShow.coordinates) {
      return [errorToShow.coordinates.east, errorToShow.coordinates.north];
    }
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
        {errorToShow.coordinates && (
          <Button
            size="xs"
            variant="ghost"
            onClick={() => {
              const view = map.getView();
              view.animate({ duration: 250, center: getCoordinateFromErrorCoordinate() });
              setIsChecked(true);
            }}
          >
            Gå til grensen
          </Button>
        )}
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
              <ErrorCodeContainer>
                <Text fontSize={"small"}>{errorToShow.code}</Text>
                <Tooltip label={`${hasCopied ? "Kopiert!" : "Kopier til utklippstavlen"}`} closeOnClick={false}>
                  <IconButton
                    icon="content_copy"
                    variant="ghost"
                    size={"xs"}
                    color="var(--kvib-colors-blue-500)"
                    onClick={() => {
                      setValue(errorToShow.code);
                      onCopy();
                    }}
                    aria-label={"Kopier feilkode"}
                  />
                </Tooltip>
              </ErrorCodeContainer>
            </div>
          </ErrorExtraInformation>
        </Collapse>
      )}
    </ErrorContent>
  );
};

const ErrorCodeContainer = styled.div`
  display: flex;
  align-items: center;
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

const ErrorContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 18px;
  border: solid 1px;
  border-color: var(--kvib-colors-gray-200);
  border-radius: 8px;
`;

const ShowMoreButton = styled(Button)`
  padding: 0px;
`;

type StepErrorProps = {
  setCurrentStep: (step: number) => void;
};

const StepError = ({ setCurrentStep }: StepErrorProps) => {
  const { closeOverlayPanel } = useOverlayPanel();
  return (
    <>
      <ErrorContainer>
        <ValidationError title="Grense krysser annen grense"></ValidationError>
        <ValidationError title="Grense mangler tilhørighet"></ValidationError>
      </ErrorContainer>
      <StepButtonGroup
        secondaryButtonText="Gå tilbake til redigering"
        secondaryButtonOnClick={closeOverlayPanel}
        primaryButtonText="Valider og gå videre"
        primaryButtonOnClick={() => setCurrentStep(2)}
        primaryButtonIsLoading={false}
      />
    </>
  );
};

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export default StepError;
