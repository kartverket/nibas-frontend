import styled, { css } from "styled-components";

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

const MetadataTitleStyles = css`
  font-size: 14px;
`;

export const MetadataValue = styled.p`
  margin: 0;
  margin-bottom: 8px;
`;

export const MetadataText = styled.p`
  margin: 0;
  ${MetadataTitleStyles};
`;

export const BlockLabel = styled.label`
  display: block;
  margin-bottom: 8px;

  ${MetadataTitleStyles};

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
