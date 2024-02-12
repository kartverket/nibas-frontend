import { UseFormSetValue, useForm } from "react-hook-form";
import { FeatureProperties } from "types/api";
import { useHistory } from "contexts/HistoryContext";
import { KontekstType, Tilhorighet, TilhorighetForm } from "./tilhorighetUtils";

type NyKretsForm = {
  navn: string;
  nummer: string;
};

export const useNyKretsForm = (
  kontekstType: KontekstType,
  tilhorighet: Tilhorighet,
  setTilhorighet: (tilhorighet: Tilhorighet, value: string) => void,
) => {
  const {
    register,
    getValues,
    reset,
    formState: { isDirty },
  } = useForm<NyKretsForm>();

  const { addHistoryEntry } = useHistory();

  const flateRegisters = {
    navn: { ...register("navn") },
    nummer: {
      ...register("nummer"),
    },
  };

  const updateDraftFromFeature = () => {
    console.log(kontekstType, tilhorighet, getValues());
    // opprett den nye kretsen ved å lage en history entry for ny krets

    // useTilhorighetFrom lytter på history entries for nye kretser og mapper disse til options i tilhorighet form

    // vi setter verdien til useTilhorigetForm til å peke på denne kretsen. // må bruke tempId?
  };

  return {
    kontekstType,
    flateRegisters,
    reset,
    isDirty,
    updateDraftFromFeature,
  };
};
