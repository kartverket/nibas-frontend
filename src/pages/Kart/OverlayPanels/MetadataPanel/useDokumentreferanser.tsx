import { Feature } from "ol";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

export type DokrefForm = {
  apiId?: string;
  dokumentlenker: string[];
  leggTilDokumentlenke: string;
  fastsettingsdato: string;
  fastsettingsmyndighet?: string;
  hjemmel?: string;
  internreferanserKartverket: string[];
  leggTilInternreferanse: string;
  rettskildeId?: string;
  rettskildeTittel: string;
};

export const useDokumentreferanser = (feature: Feature) => {
  const { register, setValue, watch } = useForm<DokrefForm>();
  const dokumentlenker = watch("dokumentlenker", []);
  const internreferanser = watch("internreferanserKartverket", []);

  useEffect(() => {
    register("dokumentlenker");
    register("internreferanserKartverket");
  }, [register]);

  useEffect(() => {
    console.log(dokumentlenker);
  }, [dokumentlenker]);

  const addDokumentlenke = (lenke: string) => {
    const oppdaterteLenker = [...dokumentlenker, lenke];
    setValue("dokumentlenker", oppdaterteLenker);
  };

  const addInternreferanse = (referanse: string) => {
    const oppdaterteReferanser = [...internreferanser, referanse];
    setValue("internreferanserKartverket", oppdaterteReferanser);
  };
  return {
    register,
    addDokumentlenke,
    dokumentlenker,
    internreferanser,
    addInternreferanse,
    watch,
  };
};
