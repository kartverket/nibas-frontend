import { useHistory } from "contexts/HistoryContext";
import { useKommuneGrunnkretser } from "hooks/inndelinger/useGrunnkretser";
import { useKommuneStemmekretser } from "hooks/inndelinger/useStemmekretser";
import { GrenseType } from "hooks/layers/types";
import { Feature } from "ol";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  FeatureProperties,
  GrunnkretsResponse,
  KontekstEgenskaper,
  StemmekretsResponse,
} from "types/api";
import { addKontekstEntryFromFeature } from "../MetadataPanel/utils";
import LineString from "ol/geom/LineString";
import { ObjectEvent } from "ol/Object";

export type Krets = {
  id: {
    lokalid: {
      value: string;
    };
    gyldighetsdato: string;
  };
  version: number;
  nummer: string;
  navn: string;
  type: "GRUNNKRETS" | "STEMMEKRETS";
};
type TilhorighetOptions = Krets[];

export type TilhorighetChoice = {
  a: string;
  b: string;
};

export type TilhorighetForm = {
  grunnkretser: TilhorighetChoice;
  stemmekretser: TilhorighetChoice;
};

const getMuligeKretserForGrense = (
  grenseType: GrenseType,
  grunnkretser: GrunnkretsResponse[],
  stemmekretser: StemmekretsResponse[],
): Krets[] => {
  if (grenseType == "Stemmekretsgrense") {
    return stemmekretser.map((stemmekrets) => {
      return {
        id: stemmekrets.id,
        version: stemmekrets.version,
        nummer: stemmekrets.stemmekretsnummer,
        navn: stemmekrets.stemmekretsnavn,
        type: "STEMMEKRETS",
      };
    });
  } else {
    return grunnkretser.map((grunnkrets) => {
      return {
        id: grunnkrets.id,
        version: grunnkrets.version,
        nummer: grunnkrets.grunnkretsnummer,
        navn: grunnkrets.navn,
        type: "GRUNNKRETS",
      };
    });
  }
};

const getTilhorighetData = (feature: Feature): TilhorighetForm | undefined => {
  const properties = feature.getProperties() as FeatureProperties;
  if (properties.kontekstEgenskaper) {
    const grunnkretser: string[] = properties.kontekstEgenskaper
      .filter((kontekstEgenskaper) => kontekstEgenskaper.type === "GRUNNKRETS")
      .map((grunnkrets) => grunnkrets.id?.lokalid.value)
      .filter((value) => value !== undefined) as string[];
    const stemmekretser: string[] = properties.kontekstEgenskaper
      .filter((kontekstEgenskaper) => kontekstEgenskaper.type === "STEMMEKRETS")
      .map((stemmekrets) => stemmekrets.id?.lokalid.value)
      .filter((value) => value !== undefined) as string[];

    if (grunnkretser && stemmekretser) {
      return {
        grunnkretser: {
          a: grunnkretser[0],
          b: grunnkretser[1],
        },
        stemmekretser: {
          a: stemmekretser[0],
          b: stemmekretser[1],
        },
      };
    }
  }
};

const getUpdatedKontekstEgenskaper = (
  newKretsIds: TilhorighetChoice,
  kretsValg: TilhorighetOptions,
): KontekstEgenskaper[] => {
  const kretser = Object.values(newKretsIds).map(
    (id) => kretsValg.find((krets) => krets.id.lokalid.value == id)!,
  );
  const nyeKontekstEgenskaper = kretser.map((krets) => {
    return {
      id: krets.id,
      type: krets.type,
      version: krets.version,
      retningMedKlokken: true,
      rekkefoelge: 0,
      flateIndeks: 0,
      hullIndeks: 0,
    };
  });
  return nyeKontekstEgenskaper;
};

export const useTilhorighet = (
  feature: Feature,
  grenseType: GrenseType,
  kommuneId: string,
  tilhorighetToChange: "grunnkretser" | "stemmekretser",
) => {
  const { data: grunnkretser } = useKommuneGrunnkretser(kommuneId);
  const { data: stemmekretser } = useKommuneStemmekretser(kommuneId);
  const [tilhorighetOptions, setTilhorighetOptions] =
    useState<TilhorighetOptions>();
  const { addHistoryEntry } = useHistory();

  useEffect(() => {
    if (grunnkretser && stemmekretser) {
      setTilhorighetOptions(
        getMuligeKretserForGrense(grenseType, grunnkretser, stemmekretser),
      );
    }
  }, [grenseType, grunnkretser, stemmekretser]);

  const {
    register,
    getValues,
    setValue,
    formState: { isDirty },
    reset,
  } = useForm<TilhorighetForm>({
    defaultValues: getTilhorighetData(feature),
  });


  const resetTilhorighet = useCallback(() => {
    if (tilhorighetOptions) {
      reset(getTilhorighetData(feature));
    }
  }, [feature, reset, tilhorighetOptions]);

  const getValuesFormatted = () => {
    const value = getValues(tilhorighetToChange);
    if (value.a !== undefined && value.b !== undefined && tilhorighetOptions) {
      return Object.values(value)
        .map((id) => {
          const krets = tilhorighetOptions.find(
            (opt) => opt.id.lokalid.value == id,
          );
          if (krets?.nummer && krets.navn) {
            return krets.nummer + " " + krets.navn;
          }
        })
        .toString()
        .replace(",", ", ");
    }
  };

  const updateDraftFromFeature = () => {
    const oldKontekstEgenskaper = (feature.getProperties() as FeatureProperties)
      ?.kontekstEgenskaper;
    if (oldKontekstEgenskaper && tilhorighetOptions) {
      console.log(oldKontekstEgenskaper);
      const oppdaterteKontekstEgenskaper = getUpdatedKontekstEgenskaper(
        getValues(tilhorighetToChange),
        tilhorighetOptions,
      );
      console.log(oppdaterteKontekstEgenskaper);
      addKontekstEntryFromFeature(
        feature as Feature<LineString>,
        oppdaterteKontekstEgenskaper,
        addHistoryEntry,
      );
    }
  };

  return {
    data: tilhorighetOptions,
    isDirty,
    register,
    getValuesFormatted,
    resetTilhorighet,
    getTilhorighetData,
    updateDraftFromFeature,
  };
};
