import styled from "styled-components";

export const KretsRow = styled.tr`
  cursor: pointer;

  &:first-child {
    td {
      border-top: none;
    }
  }

  td {
    border-top: 1px solid ${({ theme }) => theme.colors.gray};
  }
`;

export const KretsTable = styled.table`
  border-spacing: 0;
  border: none;
  width: 100%;

  > thead {
    text-transform: uppercase;
    text-align: left;
    color: ${({ theme }) => theme.colors.gray};
    font-size: 16px;

    th {
      border-bottom: 1px solid ${({ theme }) => theme.colors.black};
      position: sticky;
      top: 0;
      background: ${({ theme }) => theme.colors.white};
      padding-left: 8px;
      padding-bottom: 8px;
    }
  }

  > tbody {
    > ${KretsRow} {
      background-color: ${({ theme }) => theme.colors.blueLight};

      > td {
        padding: 8px;
        font-size: 14px;
      }
    }
  }
`;

export const KretsTableWrapper = styled.div`
  overflow-y: auto;
`;

export const ButtonCell = styled.td`
  width: 1px;
  white-space: nowrap;
`;
