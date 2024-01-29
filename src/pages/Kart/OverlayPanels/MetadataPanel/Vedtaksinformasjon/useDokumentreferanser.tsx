import { Feature } from "ol";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dokref } from "types/api";
import { VedtakinfoForm, Referanse } from "./OversiktReferanser";

const mapFromApiToForm = (dokref: Dokref): VedtakinfoForm => {
  return {
    id: dokref.id,
    fastsettingsdato: dokref.fastsettingsdato,
    fastsettingsmyndighet: dokref.fastsettingsmyndighet ?? "",
    hjemmel: dokref.hjemmel ?? "",
    rettskildeId: dokref.rettskildeId ?? "",
    rettskildeTittel: dokref.rettskildeTittel,
    dokumentlenker: dokref.dokumentlenker.map((lenke) => ({
      id: lenke.id,
      beskrivelse: lenke.beskrivelse,
    })),
    internreferanserKartverket: dokref.internReferanserKartverket.map(
      (ref) => ({
        id: ref.id,
        beskrivelse: ref.beskrivelse,
      }),
    ),
  };
};

export const useDokumentreferanser = (feature: Feature) => {
  const { register, setValue, watch } = useForm<VedtakinfoForm>();
  const dokumentlenker = watch("dokumentlenker", []);
  const internreferanser = watch("internreferanserKartverket", []);

  useEffect(() => {
    register("dokumentlenker");
    register("internreferanserKartverket");
  }, [register]);

  useEffect(() => {
    console.log(dokumentlenker);
  }, [dokumentlenker]);

  const addDokumentlenke = (lenke: Referanse) => {
    const oppdaterteLenker = [...dokumentlenker, lenke];
    setValue("dokumentlenker", oppdaterteLenker);
  };

  const addInternreferanse = (referanse: Referanse) => {
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
