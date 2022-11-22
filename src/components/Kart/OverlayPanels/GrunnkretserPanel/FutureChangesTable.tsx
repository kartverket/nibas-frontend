import useNibasApi from "hooks/useNibasApi";
import styled from "styled-components";
import {
  ApiPath,
  GrunnkretsRef,
  GrunnkretsResponse,
  StemmekretsResponse,
} from "types/api";

type Props = {
  grunnkretsRef: GrunnkretsRef;
  futureChangesUrl: ApiPath;
  headers: string[];
  getRows: (futureChanges: GrunnkretsResponse[]) => string[][];
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
  const futureChanges = [
    {
      ...(fullGrunnkrets ?? {
        id: "0",
      }),
      oppdatert: "2021-01-01",
      type: "Retting",
      gyldigFra: "2022-01-01",
      gyldigTil: "2022-04-01",
    },
    {
      id: "endrng-1",
      grunnkretsnummer: "12345678",
      navn: "Grunnkrets 1",
      oppdatert: "2022-01-01",
      type: "Kvalitetsheving",
      gyldigFra: "2022-04-01",
      gyldigTil: "2022-07-01",
    },
    {
      id: "endring-2",
      grunnkretsnummer: "87654321",
      navn: "Grunnkrets 1, men 2",
      oppdatert: "2022-07-01",
      type: "Kvalitetsheving",
      gyldigFra: "2022-07-01",
      gyldigTil: "2022-12-31",
    },
  ];

  if (!fullGrunnkrets) return null;

  const rows = getRows([fullGrunnkrets]);

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
            {rows.map((row, i) => (
              <tr key={row[i]}>
                {headers.map((header, j) => (
                  <td key={`${row[j]}-${j}`}>{row[j]}</td>
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
