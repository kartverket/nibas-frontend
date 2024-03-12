import { styled } from "styled-components";
import { Tooltip, Icon, FormErrorMessage, FormLabel } from "@kvib/react";
import { useMemo, useState } from "react";
import { FieldError } from "react-hook-form";

type Props = {
  children: React.ReactNode;
  tooltipLabel: string;
  name: string;
  error: FieldError | undefined;
  isRequired?: boolean;
};

export const VedtakinfoRow = ({ children, tooltipLabel, name, error }: Props) => {
  const [iconHovered, setIconHovered] = useState(false);

  const errorMessage = useMemo(() => {
    return error?.message;
  }, [error]);

  return (
    <>
      <Row>
        <Tooltip label={tooltipLabel} hasArrow placement="bottom">
          <TextWithIcon onMouseOver={() => setIconHovered(true)} onMouseOut={() => setIconHovered(false)}>
            <Label>{name}</Label>
            <InfoIcon>
              <Icon size={24} color="var(--kvib-colors-blue-500)" isFilled={iconHovered} icon="info"></Icon>
            </InfoIcon>
          </TextWithIcon>
        </Tooltip>
      </Row>
      <Row>{children}</Row>
      {errorMessage && <FormErrorMessage>{errorMessage}</FormErrorMessage>}
    </>
  );
};

const Label = styled(FormLabel)`
  margin: 0;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const TextWithIcon = styled.div`
  display: flex;
  margin-bottom: 8px;
  justify-content: start;
`;

const InfoIcon = styled.div`
  margin-left: 8px;
  display: flex;
  align-items: center;
  cursor: default;
`;
