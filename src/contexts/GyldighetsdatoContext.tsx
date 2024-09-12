import { format } from "date-fns";
import React, { createContext, useContext, useState } from "react";

type GyldighetsdatoContextType = {
  gyldighetsdato: string | undefined;
  setGyldighetsdato: (dato: string) => void;
  resetGyldighetsdato: () => void;
};

export const GyldighetsdatoContext = createContext<GyldighetsdatoContextType>({
  gyldighetsdato: undefined,
  setGyldighetsdato: () => {},
  resetGyldighetsdato: () => {},
});

export const GyldighetsdatoProvider = ({
  children,
  initialValue,
}: {
  children: React.ReactNode;
  initialValue?: string;
}) => {
  const [gyldighetsdato, setGyldighetsdato] = useState<string | undefined>(initialValue);
  const resetGyldighetsdato = () => setGyldighetsdato(format(new Date(), "yyyy-MM-dd"));

  const value = {
    gyldighetsdato,
    setGyldighetsdato,
    resetGyldighetsdato,
  };

  return <GyldighetsdatoContext.Provider value={value}>{children}</GyldighetsdatoContext.Provider>;
};

export const useValgtGyldighetsdato = () => {
  const context = useContext(GyldighetsdatoContext);

  if (context == null) {
    throw new Error("useGyldighetsdato must be used within a GyldighetsdatoContext");
  }

  return context;
};
