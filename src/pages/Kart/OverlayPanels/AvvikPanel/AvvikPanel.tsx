import React from "react";
import { PanelHeader, SidePanel } from "../Panel";
import { useOverlayPanel } from "../../../../contexts/OverlayPanelContext";
import { Divider } from "@kvib/react";
import AvvikRow from "./AvvikRow";
import { AvvikContent, AvvikResponse, PaginationInfo, useAvvik } from "./Avvik";
export const AvvikPanel = () => {
  const { getAvvik } = useAvvik();
  const [avvikData, setAvvikData] = React.useState<AvvikContent[]>([]);
  const [pagination, setPagination] = React.useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = React.useState<number>(0);
  const size = 20;
  React.useEffect(() => {
    const fetchAvvik = async () => {
      const avvik: AvvikResponse = await getAvvik(currentPage, size);
      setAvvikData(avvik.content);
      setPagination({
        totalPages: avvik.totalPages,
        totalElements: avvik.totalElements,
        size: avvik.size,
        number: avvik.number,
        first: avvik.first,
        last: avvik.last,
      });
    };

    fetchAvvik();
  }, [getAvvik, currentPage]);
  const { closeOverlayPanel } = useOverlayPanel();
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };
  return (
    <SidePanel>
      <PanelHeader onClose={closeOverlayPanel}>Avvik fra matrikkelen</PanelHeader>
      {avvikData.map((row) => (
        <React.Fragment key={row.lokalId}>
          <AvvikRow
            name={`Lokal ID: ${row.lokalId}`} // Display the lokalId
            tooltipLabel={`Status: ${row.status}`} // Tooltip shows the status
            valueLabel={`Koordinater: ${row.antallKoordinater}, Avvik: ${row.antallKoordinaterMedAvvik}`} // Show coordinates and deviations
          />
          <Divider />
        </React.Fragment>
      ))}
      {pagination && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
          <button disabled={pagination.first} onClick={() => handlePageChange(currentPage - 1)}>
            Forrige
          </button>
          <span>
            Side {pagination.number + 1} av {pagination.totalPages}
          </span>
          <button disabled={pagination.last} onClick={() => handlePageChange(currentPage + 1)}>
            Neste
          </button>
        </div>
      )}
    </SidePanel>
  );
};
