import { Badge } from "@kvib/react";
import { styled } from "styled-components";

export const AntallReferanser = ({
  count,
  colorScheme,
}: {
  count: number;
  colorScheme: "blue" | "gray";
}) => {
  if (count < 0) count = 0;

  return (
    <BadgeWrapper>
      <Badge colorScheme={colorScheme} variant="solid">
        {count}
      </Badge>
    </BadgeWrapper>
  );
};

const BadgeWrapper = styled.div`
  padding-left: 5px;
`;
