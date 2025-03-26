import { useCallback } from "react";
import { avvikFetcher } from "api/avvik";
import { useAuthentication } from "../../../../components/Authentication/AuthenticationHook";

export interface AvvikContent {
  lokalId: string; // Lokal ID for raden
  status: string; // Status for raden
  antallKoordinater: number; // Antall koordinater
  antallKoordinaterMedAvvik: number; // Antall koordinater med avvik
}

export interface PaginationInfo {
  totalPages: number; // Totalt antall sider
  totalElements: number; // Totalt antall elementer
  size: number; // Antall elementer per side
  number: number; // Gjeldende side (0-indeksert)
  first: boolean; // Om dette er første siden
  last: boolean; // Om dette er siste siden
}

export interface AvvikResponse extends PaginationInfo {
  content: AvvikContent[]; // Array med innholdet for denne siden
  empty: boolean; // Om denne siden er tom
}
export interface AvvikProps {
  avvikResponse: AvvikResponse; // Hele responsen med paginering og innhold
  onPageChange?: (page: number) => void; // Callback for å håndtere sideendring
}
export const useAvvik = () => {
  const { token } = useAuthentication();

  const getAvvik: (page?: number, size?: number) => Promise<AvvikResponse> = useCallback(
    async (page = 0, size = 10) => {
      const avvikJson = await avvikFetcher(token, page, size);
      return {
        content: avvikJson.content,
        totalPages: avvikJson.totalPages,
        totalElements: avvikJson.totalElements,
        size: avvikJson.size,
        number: avvikJson.number,
        first: avvikJson.first,
        last: avvikJson.last,
        empty: avvikJson.empty,
      } satisfies AvvikResponse;
    },
    [token],
  );

  return { getAvvik };
};
