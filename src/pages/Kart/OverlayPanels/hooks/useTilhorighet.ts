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
  ObjektIdentifikator,
  StemmekretsResponse,
} from "types/api";
import { addKontekstEntryFromFeature } from "../MetadataPanel/utils";
import LineString from "ol/geom/LineString";

export type Krets = {
  id: ObjektIdentifikator;
  version: number;
  nummer: string;
  navn: string;
  type: "GRUNNKRETS" | "STEMMEKRETS";
};

type TilhorighetOptions = {
  a: Krets[];
  b: Krets[];
};

type TilhorighetChoice = {
  a: string | undefined;
  b: string | undefined;
};

type TilhorighetForm = {
  grunnkretser: TilhorighetChoice;
  stemmekretser: TilhorighetChoice;
};

// Tar api respons for grunnkretser og stemmekretser og gir det tilbake på Krets typen pakket inn i TilhorighetOptions
const getMuligeKretserForGrense = (
  grenseType: GrenseType,
  grunnkretser: GrunnkretsResponse[],
  stemmekretser: StemmekretsResponse[],
): TilhorighetOptions => {
  if (grenseType === "Stemmekretsgrense") {
    const mappedStemmekretser = stemmekretser.map(
      ({ id, version, stemmekretsnummer, stemmekretsnavn }) => ({
        id,
        version,
        nummer: stemmekretsnummer,
        navn: stemmekretsnavn,
        type: "STEMMEKRETS",
      }),
    ) as Krets[];
    return {
      a: mappedStemmekretser,
      b: mappedStemmekretser,
    };
  } else {
    const mappedGrunnkretser = grunnkretser.map(
      ({ id, version, grunnkretsnummer, navn }) => ({
        id,
        version,
        nummer: grunnkretsnummer,
        navn: navn,
        type: "GRUNNKRETS",
      }),
    ) as Krets[];
    return {
      a: mappedGrunnkretser,
      b: mappedGrunnkretser,
    };
  }
};

// tar to kontekstEgenskaper og mapper de til TilhorighetForm
const getTilhorighetData = (
  tilhorigheter: KontekstEgenskaper[] | undefined,
): TilhorighetForm | undefined => {
  if (tilhorigheter && tilhorigheter.length == 2) {
    const grunnkretser = tilhorigheter
      .filter((kontekstEgenskaper) => kontekstEgenskaper.type === "GRUNNKRETS")
      .map((grunnkrets) => grunnkrets.id?.lokalid.value);
    const stemmekretser = tilhorigheter
      .filter((kontekstEgenskaper) => kontekstEgenskaper.type === "STEMMEKRETS")
      .map((stemmekrets) => stemmekrets.id?.lokalid.value);

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

// Tar lokalider og mapper de til kretsValgene hvis det finnes en krets i kretsValg med tilsvarende id
const getUpdatedKontekstEgenskaper = (
  newKretsIds: TilhorighetChoice,
  kretsValg: TilhorighetOptions,
): KontekstEgenskaper[] => {
  const kretser = Object.values(newKretsIds).map(
    (id) =>
      kretsValg.a
        .concat(kretsValg.b)
        .find((krets) => krets.id.lokalid.value === id)!,
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
  kontekstEgenskaper: KontekstEgenskaper[] | undefined,
) => {
  const [tilhorighetToChange, setTilhorighetToChange] = useState<
    "grunnkretser" | "stemmekretser" | null
  >(null);
  const grenseType = (feature.getProperties() as FeatureProperties)
    .type as GrenseType;

  const kommunerID = [
    ...new Set(
      kontekstEgenskaper?.map((kontekst) => kontekst.kommuneId?.lokalid.value),
    ),
  ].filter((id) => id != null) as string[];
  console.log(kommunerID)

  const { data: grunnkretser } = useKommuneGrunnkretser(kommunerID[0]);
  const { data: stemmekretser } = useKommuneStemmekretser(kommunerID[0]);

  useEffect(() => {
    setTilhorighetToChange(
      grenseType === "Grunnkretsgrense" || grenseType === "Delområdegrense"
        ? "grunnkretser"
        : grenseType === "Stemmekretsgrense"
          ? "stemmekretser"
          : null,
    );
  }, [feature, grenseType]);

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
    formState: { isDirty },
    reset,
  } = useForm<TilhorighetForm>({
    defaultValues: getTilhorighetData(kontekstEgenskaper),
  });

  const resetTilhorighet = useCallback(() => {
    if (tilhorighetOptions) {
      reset(getTilhorighetData(kontekstEgenskaper));
    }
  }, [kontekstEgenskaper, reset, tilhorighetOptions]);

  const getValuesFormatted = () => {
    if (tilhorighetToChange) {
      const value = getValues(tilhorighetToChange);
      if (
        value.a !== undefined &&
        value.b !== undefined &&
        tilhorighetOptions
      ) {
        return Object.values(value)
          .map((id) => {
            const krets = tilhorighetOptions.a
              .concat(tilhorighetOptions.b)
              .find((opt) => opt.id.lokalid.value === id);
            if (krets?.nummer && krets.navn) {
              return krets.nummer + " " + krets.navn;
            }
          })
          .join(", ");
      }
    }
  };

  const updateDraftFromFeature = () => {
    if (tilhorighetToChange && kontekstEgenskaper && tilhorighetOptions) {
      const oppdaterteKontekstEgenskaper = getUpdatedKontekstEgenskaper(
        getValues(tilhorighetToChange),
        tilhorighetOptions,
      );
      addKontekstEntryFromFeature(
        feature as Feature<LineString>,
        oppdaterteKontekstEgenskaper,
        addHistoryEntry,
      );
    }
  };

  return {
    tilhorighetToChange,
    data: tilhorighetOptions,
    isDirty,
    register,
    getValuesFormatted,
    resetTilhorighet,
    getTilhorighetData,
    updateDraftFromFeature,
  };
};
