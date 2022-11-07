import styled from "styled-components";
import Label from "components/form/Label";

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
