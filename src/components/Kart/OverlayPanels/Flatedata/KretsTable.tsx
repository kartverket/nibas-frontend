import styled from "styled-components";

export const KretsTable = styled.table`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 200px;
  line-height: 2;

  thead,
  tbody,
  tr {
    display: contents;
  }

  td,
  th {
    padding: 16px;
    min-height: 70px;
  }

  th {
    font-weight: normal;
    text-align: left;
    font-size: 14px;
  }
`;

export const KretsRow = styled.tr<{ isActive: boolean }>`
  position: relative;

  td {
    border-bottom: 2px solid var(--kvib-colors-gray-50);
  }
`;

export const ButtonCell = styled.td`
  width: 1%;
  white-space: nowrap;
`;
