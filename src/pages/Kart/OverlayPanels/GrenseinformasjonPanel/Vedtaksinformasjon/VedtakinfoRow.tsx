import { styled } from "styled-components";
import { Tooltip, Text, Icon, AlertIcon, AlertDescription, Alert } from "@kvib/react";
import { useState } from "react";
import { FieldError } from "react-hook-form";

type Props = {
  children: React.ReactNode;
  tooltipLabel: string;
  name: string;
  errors: FieldError | undefined;
  errorMessage?: string | undefined;
};

const getErrorMessage = (errors: FieldError | undefined, errorMessage: string | undefined) => {
  if (!errors) return undefined;
  if (errorMessage) return errorMessage;
  if (errors.message) return errors.message;
};

export const VedtakinfoRow = ({ children, tooltipLabel, name, errors, errorMessage = undefined }: Props) => {
  const [iconHovered, setIconHovered] = useState(false);
  const errorString = getErrorMessage(errors, errorMessage);

  return (
    <Container>
      <Row>
        <Tooltip label={tooltipLabel} hasArrow placement="bottom">
          <TextWithIcon onMouseOver={() => setIconHovered(true)} onMouseOut={() => setIconHovered(false)}>
            <Text as="b">{name}</Text>
            <InfoIcon>
              <Icon size={24} color="var(--kvib-colors-blue-500)" isFilled={iconHovered} icon={"info"}></Icon>
            </InfoIcon>
          </TextWithIcon>
        </Tooltip>
      </Row>
      <Row>{children}</Row>
      <Row>
        {errorString && (
          <AlertContainer status="error" variant={"solid"}>
            <AlertIcon />
            <AlertContent>
              <AlertDescription>{errorString}</AlertDescription>
            </AlertContent>
          </AlertContainer>
        )}
      </Row>
    </Container>
  );
};

const AlertContainer = styled(Alert)`
  margin-top: 5px;
`;

const AlertContent = styled.div`
  padding: 5px;
`;

const Container = styled.div`
  margin-top: 5px;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const TextWithIcon = styled.div`
  margin-bottom: 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const InfoIcon = styled.div`
  margin-left: 8px;
  display: flex;
  align-items: center;
  cursor: default;
`;
