import useNibasApi from "hooks/useNibasApi";
import { useMemo } from "react";
import { styled } from "styled-components";
import { GrunnkretsResponse, StemmekretsResponse } from "types/api";

export type TableRow = {
  id: string;
  cells: (string | undefined)[];
};

type Props<T extends GrunnkretsResponse | StemmekretsResponse> = {
  id: string;
  futureChangesUrl:
    | "/v1/grunnkretser/{lokalid}/framtidigeversjoner"
    | "/v1/stemmekretser/{lokalid}/framtidigeversjoner";
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
              <td key={`${row.id}-${cell}`}>{cell ?? "---"}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

const Table = styled.table`
  width: 100%;
  background-color: var(--white);
  border-spacing: 0;

  tr:first-child > td {
    background-color: var(--green_light);

    &:first-child {
      border-left: 4px solid var(--green);
    }
  }

  td,
  th {
    font-size: 14px;
  }

  th {
    border-bottom: 1px solid var(--gray);
    text-align: left;
    font-weight: normal;
    padding: 8px 12px;
  }

  td {
    padding: 8px;
    color: var(--gray_dark);
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-bottom: 2px solid var(--gray_light);
  }
`;

export const FutureChangesTableData = styled.td`
  border-top: 2px solid var(--gray);
  background-color: var(--gray_light);
  width: 100%;
  padding: 32px 16px;
`;

export default FutureChangesTable;
