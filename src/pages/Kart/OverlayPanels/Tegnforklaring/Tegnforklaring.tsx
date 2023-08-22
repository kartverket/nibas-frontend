import { styled } from "styled-components";

export type TegnforklaringProps = {
  color: string;
  dotted: boolean;
  text: string;
};

export const Tegnforklaring = ({
  color,
  dotted,
  text,
}: TegnforklaringProps) => {
  return (
    <Wrapper>
      <LineWrapper>
        <Line $dotted={dotted} $color={color} />
      </LineWrapper>
      <TextContent>{text}</TextContent>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 10px;
`;

const TextContent = styled.div`
  flex: 3;
  margin-left: 20px;
  font-weight: 600;
`;

const LineWrapper = styled.div`
  flex: 1;
`;

type LineProps = {
  $color: string;
  $dotted: boolean;
};

const Line = styled.div<LineProps>`
  margin-top: 12px;
  border-bottom: 4px ${(props) => (props.$dotted ? "dotted" : "solid")}
    ${(props) => props.$color};
`;
