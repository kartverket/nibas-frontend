import useNibasApi from "hooks/useNibasApi";
import { useMemo } from "react";
import styled from "styled-components";
import {
  ApiPath,
  GrunnkretsRef,
  GrunnkretsResponse,
  StemmekretsResponse,
} from "types/api";

export type TableRow = {
  id: string;
  cells: string[];
};

type Props = {
  grunnkretsRef: GrunnkretsRef;
  futureChangesUrl: ApiPath;
  headers: string[];
  getRows: (futureChanges: GrunnkretsResponse[]) => TableRow[];
};

const FutureChangesTable = ({
  grunnkretsRef,
  futureChangesUrl,
  headers,
  getRows,
}: Props) => {
  const { data: fullGrunnkrets } = useNibasApi("/v1/grunnkretser/{id}", {
    id: grunnkretsRef.id,
  });
  // const { data: futureChanges } = useNibasApi("/v1/grunnkretser/{id}/framtidige-endringer");

  const rows = useMemo(
    () => (fullGrunnkrets ? getRows([fullGrunnkrets]) : null),
    [fullGrunnkrets, getRows]
  );

  if (!rows) return null;

  return (
    <tr>
      <TableData colSpan={4}>
        <Table>
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                {row.cells.map((cell) => (
                  <td key={`${row.id}-${cell}`}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      </TableData>
    </tr>
  );
};

const TableData = styled.td`
  border-top: 2px solid ${({ theme }) => theme.colors.gray};
  background-color: ${({ theme }) => theme.colors.grayLight};
  width: 100%;
  padding: 32px 16px;
`;

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
