import { styled } from "styled-components";
import {
  Tooltip,
  Text,
  Icon,
  FormLabel,
  AlertIcon,
  AlertDescription,
  Alert,
} from "@kvib/react";
import { InfoIcon, TextWithIcon } from "../MetadataGenerelt";
import { useState } from "react";
import { FieldError } from "react-hook-form";

type Props = {
  children: React.ReactNode;
  tooltipLabel: string;
  name: string;
  errors: FieldError | undefined;
};

export const VedtakinfoRow = ({
  children,
  tooltipLabel,
  name,
  errors,
}: Props) => {
  const [iconHovered, setIconHovered] = useState(false);

  return (
    <Container>
      <Row>
        <Tooltip label={tooltipLabel} hasArrow placement="bottom">
          <TextWithIcon
            onMouseOver={() => setIconHovered(true)}
            onMouseOut={() => setIconHovered(false)}
          >
            <Text as="b">{name}</Text>
            <InfoIcon>
              <Icon
                size={24}
                color="var(--kvib-colors-blue-500)"
                isFilled={iconHovered}
                icon={"info"}
              ></Icon>
            </InfoIcon>
          </TextWithIcon>
        </Tooltip>
      </Row>
      <Row>{children}</Row>
      <Row>
        {errors?.message && (
          <AlertContainer status="error" variant={"solid"}>
            <AlertIcon />
            <AlertContent>
              <AlertDescription>{errors.message}</AlertDescription>
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
  margin: 10px;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-bottom: 3px;
`;
