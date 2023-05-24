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

  td {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  th {
    font-weight: normal;
    text-align: left;
    font-size: 14px;
  }
`;

export const KretsRow = styled.tr<{ isActive: boolean }>`
  position: relative;
  vertical-align: baseline;

  ::after {
    content: "";
    position: absolute;
    left: 0;
    height: 100%;
    width: 3px;
    transition: background 0.1s;
    ${({ isActive }) =>
      isActive &&
      css`
        background: var(--blue_dark);
      `};
  }

  :hover::after {
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
