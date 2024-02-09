import { UseFormSetValue, useForm } from "react-hook-form";
import { FeatureProperties } from "types/api";
import { TilhorighetForm } from "./useTilhorighet";
import { Tilhorighet } from "../MetadataPanel/TilhorighetField";
import { useHistory } from "contexts/HistoryContext";

type FlateForm = {
  navn: string;
  nummer: string;
};

export const useFlateForm = (
  grenseFeatureProperties: FeatureProperties,
  tilhorighet: Tilhorighet | undefined,
  setTilhorighet: UseFormSetValue<TilhorighetForm>,
  updateTilhorighet: () => void,
) => {
  const {
    register,
    getValues,
    reset,
    formState: { isDirty },
  } = useForm<FlateForm>();

  const { addHistoryEntry } = useHistory();

  const type =
    grenseFeatureProperties?.kontekstEgenskaper?.map((k) => k.type)[0] ?? null;

  const tilhorighetToChange =
    type === "GRUNNKRETS"
      ? "grunnkretser"
      : type === "STEMMEKRETS"
        ? "stemmekretser"
        : null;

  const flateRegisters = {
    navn: { ...register("navn") },
    nummer: {
      ...register("nummer"),
    },
  };

  const updateDraftFromFeature = () => {
    if (tilhorighetToChange && tilhorighet) {
      // TODO Dette er dust skal fikse
      const tilhorighetKey = `${tilhorighetToChange}.${tilhorighet}` as
        | "grunnkretser.a"
        | "grunnkretser.b"
        | "stemmekretser.a"
        | "stemmekretser.b";

      // Setter verdien til tilhorighet formet
      setTilhorighet(tilhorighetKey, getValues("nummer")); // akkurat nå må dette være en lokalid, kanskje vi kan endre dette?

      //Lager history entry på nye krets, tilhørighet kan lytte på history for å få nye krets i lista si.

      //TODO

      //oppdaterer tilhorighetForm som vanlig
      updateTilhorighet();
    }
  };

  return {
    type,
    flateRegisters,
    reset,
    isDirty,
    updateDraftFromFeature,
  };
};
