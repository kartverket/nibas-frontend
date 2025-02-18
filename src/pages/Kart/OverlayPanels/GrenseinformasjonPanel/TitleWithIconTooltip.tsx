import { Icon, Tooltip } from "@kvib/react";
import { PropsWithChildren, useState } from "react";
import { styled } from "styled-components";

type Props = {
  tooltipLabel: string;
} & PropsWithChildren;

export const TitleWithIconTooltip = ({ children, tooltipLabel }: Props) => {
  const [iconHovered, setIconHovered] = useState(false);

  return (
    <Tooltip label={tooltipLabel} hasArrow placement="bottom">
      <TextWithIcon onMouseOver={() => setIconHovered(true)} onMouseOut={() => setIconHovered(false)}>
        {children}
        <InfoIcon>
          <Icon size={24} color="var(--kvib-colors-blue-500)" isFilled={iconHovered} icon="info"></Icon>
        </InfoIcon>
      </TextWithIcon>
    </Tooltip>
  );
};

const TextWithIcon = styled.div`
  display: flex;
  align-items: center;
`;
const InfoIcon = styled.div`
  margin-left: 8px;
  display: flex;
  align-items: center;
  cursor: help;
`;
