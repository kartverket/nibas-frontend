import { styled } from "styled-components";
import { Tooltip, Text, Icon, FormLabel } from "@kvib/react";
import { InfoIcon, TextWithIcon } from "../MetadataGenerelt";
import { useState } from "react";

type Props = {
  children: React.ReactNode;
  tooltipLabel: string;
  name: string;
};

export const VedtakinfoRow = ({ children, tooltipLabel, name }: Props) => {
  const [iconHovered, setIconHovered] = useState(false);

  return (
    <Container>
      <Row>
        <Tooltip label={tooltipLabel} hasArrow placement="bottom">
          <TextWithIcon
            onMouseOver={() => setIconHovered(true)}
            onMouseOut={() => setIconHovered(false)}
          >
            <FormLabel as="b">{name}</FormLabel>
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
    </Container>
  );
};

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
`;
