import React, { createContext, useContext } from "react";
import useNibasApi from "hooks/useNibasApi";
import { KodelisteRespons, MatrikkelKodelisterRespons } from "types/api";

type KodelisteContextType = {
  kodeliste: KodelisteRespons | null;
  matrikkelkodeliste: MatrikkelKodelisterRespons | null;
};

const KodelisteContext = createContext<KodelisteContextType | undefined>(undefined);

export const KodelisteProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: kodeliste } = useNibasApi("/v1/kodeliste/maalemetode-koder");
  const { data: matrikkelkodeliste } = useNibasApi("/v1/matrikkelkodelister");
  return (
    <KodelisteContext.Provider value={{ kodeliste: kodeliste ?? null, matrikkelkodeliste: matrikkelkodeliste ?? null }}>
      {children}
    </KodelisteContext.Provider>
  );
};

export const useKodeliste = (): KodelisteContextType => {
  const context = useContext(KodelisteContext);
  if (!context) {
    throw new Error("useKodeliste must be used within a KodelisteProvider");
  }
  return context;
};
