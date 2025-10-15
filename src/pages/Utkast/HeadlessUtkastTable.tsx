import { SkeletonText, Table, Td, Tr } from "@kvib/react";
import { styled } from "styled-components";
import { UtkastResponse } from "types/api";

export type Column<UtkastResponse> = {
  header: string;
  renderCell: (utkast: UtkastResponse) => React.ReactNode;
};

export const HeadlessUtkastTable = ({
  columns,
  utkasts,
  isLoading,
  onRowClick,
}: {
  columns: Column<UtkastResponse>[];
  utkasts: UtkastResponse[] | undefined;
  isLoading: boolean;
  onRowClick?: (utkast: UtkastResponse) => void;
}) => {
  return (
    <Table>
      <thead>
        <tr>
          {columns.map((column) => (
            <TableHeader key={column.header}>{column.header}</TableHeader>
          ))}
        </tr>
      </thead>
      <tbody>
        {utkasts != null && !isLoading
          ? utkasts?.map((utkast) => (
              <StyledTr key={utkast.id} onClick={() => onRowClick?.(utkast)} $isClickable={onRowClick != null}>
                {columns.map((column) => (
                  <StyledCell key={column.header}>{column.renderCell(utkast)}</StyledCell>
                ))}
              </StyledTr>
            ))
          : isLoading &&
            Array.from({ length: 5 }).map((_, index) => (
              <Tr key={index}>
                {columns.map((column) => (
                  <StyledCell key={column.header}>
                    <SkeletonText noOfLines={1} height="24px" skeletonHeight="24px" />
                  </StyledCell>
                ))}
              </Tr>
            ))}
      </tbody>
    </Table>
  );
};

const StyledTr = styled(Tr)<{ $isClickable: boolean }>`
  cursor: ${(props) => (props.$isClickable ? "pointer" : "default")};

  &:hover {
    background-color: ${(props) => (props.$isClickable ? "var(--kvib-colors-blue-50)" : "transparent")};
  }
`;

const TableHeader = styled.th`
  font-weight: 600;
  padding: 12px 28px;
  text-align: unset;
  border-bottom: 1px solid var(--kvib-colors-gray-200);
`;

const StyledCell = styled(Td)`
  padding: 16px 28px;
  border-color: var(--kvib-colors-gray-200);
`;
