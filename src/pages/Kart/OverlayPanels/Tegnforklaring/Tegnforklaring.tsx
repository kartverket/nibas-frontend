import { styled } from "styled-components";

export type TegnforklaringProps = {
  color: string;
  dotted: boolean;
  text: string;
};

export const Tegnforklaring = ({ color, dotted, text }: TegnforklaringProps) => {
  return (
    <Wrapper>
      <LineWrapper>
        <Line $dotted={dotted} $color={color}>
          <DotWrapper>
            <Dot $color={color} />
            <Dot $color={color} $endPoint={false} />
            <Dot $color={color} />
          </DotWrapper>
        </Line>
      </LineWrapper>
      <TextContent>{text}</TextContent>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 14px;
`;

const TextContent = styled.div`
  flex: 4;
  margin-left: 16px;
  font-weight: 600;
`;

const LineWrapper = styled.div`
  position: relative;
  flex: 1;
`;

type LineProps = {
  $color: string;
  $dotted: boolean;
};

type DotProps = {
  $color: string;
  $endPoint?: boolean;
};

const Line = styled.div<LineProps>`
  margin-top: 10px;
  border-bottom: ${(props) => `3px ${props.$dotted ? "dashed" : "solid"} ${props.$color}`};
`;

const DotWrapper = styled.div`
  position: absolute;
  display: flex;
  top: 5px;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const Dot = styled.div<DotProps>`
  height: ${(props) => (props.$endPoint !== false ? "12px" : "7px")};
  width: ${(props) => (props.$endPoint !== false ? "12px" : "7px")};
  border-radius: 50%;
  display: inline-block;
  background: ${(props) => (props.$endPoint !== false ? "white" : props.$color)};
  border: ${(props) => `${props.$endPoint !== false ? "3px" : "0"} solid ${props.$color}`};
`;
