import { Badge } from "@kvib/react";
import { styled } from "styled-components";

export const AntallReferanser = ({ count, isSelected = false }: { count: number; isSelected: boolean }) => {
  if (count < 0) count = 0;
  return (
    <BadgeWrapper>
      <Badge colorScheme={isSelected ? "blue" : "gray"} variant="solid">
        {count}
      </Badge>
    </BadgeWrapper>
  );
};

const BadgeWrapper = styled.div`
  padding-left: 5px;
`;
