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

const FutureChangesTable = <T extends GrunnkretsResponse | StemmekretsResponse>({
  id,
  futureChangesUrl,
  headers,
  getRows,
}: Props<T>) => {
  const { data: futureChanges } = useNibasApi(futureChangesUrl, {
    lokalid: id,
  });

  const rows = useMemo(() => (futureChanges ? getRows(futureChanges as T[]) : null), [futureChanges, getRows]);

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
  background: var(--kvib-colors-chakra-body-bg);
  border-spacing: 0;

  td,
  th {
    font-size: 14px;
  }

  td {
    padding: 8px;
    color: var(--kvib-colors-gray-600);
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-bottom: 2px solid var(--kvib-colors-gray-50);
  }

  th {
    border-bottom: 1px solid var(--kvib-colors-gray-500);
    text-align: left;
    font-weight: normal;
    padding: 8px 12px;
  }

  tr:first-child > td {
    background: var(--kvib-colors-green-100);

    &:first-child {
      border-left: 4px solid var(--kvib-colors-green-400);
    }
  }
`;

export default FutureChangesTable;
