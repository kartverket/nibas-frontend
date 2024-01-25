import { styled } from "styled-components";
import { Tooltip, Text, Icon } from "@kvib/react";
import { InfoIcon, TextWithIcon } from "./MetadataGenerelt";
import { useState } from "react";

type Props = {
  children: React.ReactNode;
  tooltipLabel: string;
  name: string;
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

export const DokrefRow = ({ children, tooltipLabel, name }: Props) => {
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
      {children}
    </Container>
  );
};
