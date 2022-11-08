import styled from "styled-components";
import Label from "components/form/Label";
import { KartInteractable } from "../KartInteractable";
import Heading from "components/typography/Heading";
import Button from "components/form/Button";

export const Container = styled.div`
  display: flex;
  justify-content: flex-start;

  @media (min-width: ${({ theme }) => theme.dimensions.lgPx}) {
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

  @media (min-width: ${({ theme }) => theme.dimensions.lgPx}) {
    margin: 8px 0;

    &:first-child,
    &:last-child {
      margin: 8px 0;
    }
  }
`;

export const MetadataValue = styled.p`
  margin: 0;
  margin-bottom: 8px;
`;

export const MetadataText = styled.p`
  margin: 0;
  font-size: 14px;
`;

export const BlockLabel = styled(Label)`
  display: block;
  margin-bottom: 8px;

  > * {
    margin-top: 4px;
    width: 100%;
    margin-bottom: 8px;
  }
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

export const OverlayPanelWrapper = styled(KartInteractable)<{
  gridArea: "metadata" | "kretser";
  minimized?: boolean;
}>`
  position: relative;
  grid-area: ${({ gridArea }) => gridArea};
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  margin-left: auto;
  padding: 16px;
  border-radius: 3px;
  height: ${({ minimized }) => (minimized ? 72 : 500)}px;
  border: 2px solid ${({ theme }) => theme.colors.blue};
  border-bottom: none;
  border-right: none;
  overflow-y: auto;

  /* @media (min-width: ${({ theme }) => theme.dimensions.lgPx}) {
    border-bottom: 2px solid ${({ theme }) => theme.colors.blue};
  } */

  min-width: 500px;
  width: 100%;
  max-width: 1000px;

  transition: height 0.4s ease-in-out;

  > ${Heading} {
    margin-top: 8px;
    margin-bottom: 16px;
  }
`;

export const HeaderButton = styled(Button).attrs(() => ({
  variant: "unstyled",
}))<{ right: number }>`
  position: absolute;
  top: 0;
  right: ${({ right }) => right}px;
  margin: 16px;
  color: ${({ theme }) => theme.colors.blueDark};

  > span {
    font-size: 36px;
  }
`;
