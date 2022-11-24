import useNibasApi from "hooks/useNibasApi";
import { useMemo } from "react";
import styled from "styled-components";
import { GrunnkretsResponse, StemmekretsResponse } from "types/api";

export type TableRow = {
  id: string;
  cells: string[];
};

type Props<T extends GrunnkretsResponse | StemmekretsResponse> = {
  id: string;
  futureChangesUrl: "/v1/grunnkretser/{lokalid}/framtidigeversjoner";
  headers: string[];
  getRows: (futureChanges: T[]) => TableRow[];
};

const FutureChangesTable = <
  T extends GrunnkretsResponse | StemmekretsResponse
>({
  id,
  futureChangesUrl,
  headers,
  getRows,
}: Props<T>) => {
  const { data: futureChanges } = useNibasApi(futureChangesUrl, {
    lokalid: id,
  });

  const rows = useMemo(
    () => (futureChanges ? getRows(futureChanges as T[]) : null),
    [futureChanges, getRows]
  );

  if (!rows) return null;

  return (
    <Table>
      <thead>
        <tr>
          {headers.map((header) => (
            <th key={header}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {row.cells.map((cell) => (
              <td key={`${row.id}-${cell}`}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

const Table = styled.table`
  width: 100%;
  background-color: ${({ theme }) => theme.colors.white};
  border-spacing: 0;

  tr:first-child > td {
    background-color: ${({ theme }) => theme.colors.greenLight};

    &:first-child {
      border-left: 4px solid ${({ theme }) => theme.colors.green};
    }
  }

  td,
  th {
    font-size: 14px;
  }

  th {
    border-bottom: 1px solid ${({ theme }) => theme.colors.gray};
    text-align: left;
    font-weight: normal;
    padding: 8px 12px;
  }

  td {
    padding: 8px;
    color: ${({ theme }) => theme.colors.grayDark};
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-bottom: 2px solid ${({ theme }) => theme.colors.grayLight};
  }
`;

export default FutureChangesTable;
