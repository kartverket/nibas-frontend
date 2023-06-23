import styled, { css } from "styled-components";

export const KretsTable = styled.table`
  width: 100%;
  border-spacing: 0;
  table-layout: fixed;

  td,
  th {
    width: 100%;
    padding: 16px;

    &:last-child {
      width: 200px;
    }
  }

  th {
    font-weight: normal;
    text-align: left;
    font-size: 14px;
  }
`;

export const KretsRow = styled.tr<{ isActive: boolean }>`
  position: relative;

  &::after {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 3px;
    ${({ isActive }) =>
      isActive &&
      css`
        background: var(--blue_dark);
      `};
  }

  &:hover::after {
    background: var(--blue_dark);
  }

  td {
    border-bottom: 2px solid var(--gray_light);
  }
`;

export const ButtonCell = styled.td`
  width: 1%;
  white-space: nowrap;
`;
