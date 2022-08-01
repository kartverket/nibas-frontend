import styled from "styled-components";

export const KretsRow = styled.tr``;

export const KretsTable = styled.table`
  border-spacing: 0;
  border: none;
  width: 100%;

  thead {
    text-transform: uppercase;
    text-align: left;
    color: ${({ theme }) => theme.colors.gray};
    font-size: 16px;

    th {
      border-bottom: 1px solid ${({ theme }) => theme.colors.black};
      padding-left: 8px;
      padding-bottom: 8px;
    }
  }

  tbody {
    ${KretsRow} {
      background-color: ${({ theme }) => theme.colors.blueLight};

      &:nth-child(2n) {
        background-color: ${({ theme }) => theme.colors.white};
      }
    }

    td {
      padding: 8px;
      font-size: 14px;
    }
  }
`;
