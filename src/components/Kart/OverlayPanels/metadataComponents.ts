import styled, { keyframes } from "styled-components";
import Heading from "components/typography/Heading";
import Button from "components/form/Button";
import { Outline } from "style/mixins";

export const Container = styled.div`
  display: flex;
  justify-content: flex-start;

  @media (min-width: var(--screenBreakXxl)) {
    flex-direction: column;
  }
`;

export const Part = styled.div`
  flex: 1;
  margin: 0 16px;

  &:first-child,
  &:last-child {
    margin: 0;
  }

  @media (min-width: var(--screenBreakXxl)) {
    margin: 8px 0;

    &:first-child,
    &:last-child {
      margin: 8px 0;
    }
  }
`;

export const MetadataValue = styled.p`
  margin: 8px 0;
  font-size: 14px;
`;

export const MetadataText = styled.p`
  margin: 8px 0;
  margin-right: 4px;
  font-size: 14px;
  color: var(--gray);
`;

export const DateWrapper = styled(Part)`
  display: flex;

  > * {
    flex: 1;
    margin: 0 8px;
    min-width: 100px;

    &:first-child {
      margin-left: 0;
    }

    &:last-child {
      margin-right: 0;
    }
  }
`;

export const InputRow = styled(Part)`
  display: flex;
  gap: 20px;

  > :first-child {
    flex: 1;
  }
`;

const moveInFromLeft = keyframes`
0% {
  transform: translateX(-100%);
  z-index: -1;
}
99% {
  z-index: -1;
}
100% {
  transform: none; 
}
`;

export const OverlayPanelWrapper = styled.div<{
  gridArea: "metadata" | "kretser";
  minimized?: boolean;
}>`
  display: inline-block;
  background-color: white;
  pointer-events: auto;
  position: relative;
  grid-area: ${({ gridArea }) => gridArea};
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 16px;
  border-radius: 0 3px 3px 3px;
  height: ${({ minimized }) => (minimized ? 70 : 520)}px;
  border: 4px solid var(--gray_light);
  border-bottom: none;
  border-left: none;

  max-width: 1000px;
  transition: height 0.4s ease-in-out;
  animation: ${moveInFromLeft} 0.5s ease-in-out;

  > ${Heading} {
    margin-top: 8px;
    margin-bottom: 16px;
  }
`;

export const PanelHeader = styled.header<{ borderBottom?: boolean }>`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 8px 16px;
  border-bottom: ${({ borderBottom }) => (borderBottom ? 2 : 0)}px solid
    var(--gray_light);
`;

export const PanelTitle = styled(Heading)`
  margin: 0;
  margin-right: auto;
`;

export const PanelHeaderButton = styled(Button).attrs(() => ({
  variant: "unstyled",
}))`
  color: var(--blue_dark);
  border-radius: 50%;
  transition: background 0.1s;

  &:hover,
  &:focus-visible {
    background: var(--blue_light);
  }

  &:focus-visible {
    ${Outline};
  }

  > span {
    font-size: 36px;
  }
`;

export const Separator = styled.div`
  border-top: 2px solid var(--gray);
  height: 1px;
`;

export const DateRow = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const Date = styled.div`
  display: flex;
`;
