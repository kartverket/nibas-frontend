import styled from "styled-components";

export const KretsTable = styled.table`
  width: 100%;
  border-spacing: 0;
  table-layout: fixed;

  td,
  th {
    padding: 16px;
    width: 100%;
  }

  th {
    font-weight: normal;
    text-align: left;
    font-size: 14px;
  }
`;

// TODO: sjekk om denne skal ha hover på samme måte som før, må kanskje ha isActive igjen
export const KretsRow = styled.tr`
  position: relative;
  vertical-align: baseline;

  ::after {
    content: "";
    position: absolute;
    left: 0;
    height: 100%;
    width: 3px;
    transition: background 0.1s;
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
