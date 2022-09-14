import { createContext, useContext, useEffect, useState } from "react";
import { GeoJSONFeature, GeoJSONFeatureCollection } from "ol/format/GeoJSON";
import { useMatch } from "react-router-dom";
import { GrunnkretsRequest, StemmekretsRequest } from "types/api";

const grunnkretsUtkast: GrunnkretsRequest = {
  grunnkretsnummer: "12345678",
  identifikasjon: {
    lokalid: "lokalid",
    navnerom: "navnerom",
    versjonid: "versjonId",
  },
  navn: "Mock grunnkrets",
};

const stemmekretsUtkast: StemmekretsRequest = {
  stemmekretsnavn: "SNEISEN 2.0",
  stemmekretsnummer: "10",
  identifikasjon: {
    lokalid: "ae914f4b-dbdc-4e08-9f8a-0b5e4457ae9f",
    navnerom: "https://data.geonorge.no/sosi/administrativeenheter",
    versjonid: undefined,
  },
  kommunenummer: "a4400206-5903-4eff-9c36-4d2d37683caa",
  tellekretsnummer: "Et nytt nummer",
  tellekretsnavn: "Nytt navn",
  valgdistriktsnummer: "12345678",
};

const grenserUtkast: GeoJSONFeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          [284142.48, 7029641.48],
          [282128.90227058844, 7030481.795570342],
          [285008.31, 7031415.44],
          [284480.57, 7032018.86],
          [284476.07, 7032023.09],
          [284473.77, 7032025.27],
        ],
      },
      properties: {
        type: "Kommunegrense",
        metadata: {
          discriminator: "AdministrativGrenseMetadata",
          common: {
            identifikasjon: {
              lokalid: "7bb1e90c-7915-49e8-8506-2d89fc2303c4",
              navnerom: "https://data.geonorge.no/sosi/administrativeenheter",
              versjonid: null,
            },
            datafangstdato: null,
            gyldigFra: null,
            gyldigTil: null,
            informasjon: null,
            sporingsinformasjon: {
              oppdateringsdato: "2022-08-29",
              endretAv: null,
            },
            opphav: null,
          },
          commonGrense: {
            posisjonskvalitet: null,
            grensestatus: {
              id: null,
              href: "http://localhost:8080/v1/kodeliste/grensestatuser",
            },
            fastsettingstype: {
              id: null,
              href: "http://localhost:8080/v1/kodeliste/fastsettingstyper",
            },
          },
          dokumentasjonsreferanser: [],
          foelgerTerrengdetalj: {
            id: null,
            href: "http://localhost:8080/v1/kodeliste/terrengdetaljkoder",
          },
          noeyaktighetsklasse: {
            id: "MiddelsNøyaktigeOgTransformerteMålinger",
            href: "http://localhost:8080/v1/kodeliste/noeyaktighetsklasser",
          },
          omtvistet: false,
        },
        kontekstEgenskaper: {
          id: "38a3afc0-58af-4b1a-aeee-9026348e73f2",
          type: "STEMMEKRETS",
          retningMedKlokken: false,
          rekkefoelge: 15,
          flateIndeks: 1,
          hullIndeks: null,
        },
        inndelingerKontekst: {
          id: "ca6224b8-1cab-483e-9d67-cf6cd7f5fe98",
          type: "stemmekrets",
        },
      },
      id: "64ab9c01-75cb-4ed9-a9b9-c43ae7bf3a29",
    },
    {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          [284142.48, 7029641.48],
          [284139.32, 7029556.97],
          [284137.52, 7029524.46],
          [284138.51, 7029516.36],
          [281342.3118297125, 7028704.683833549],
          [284177.12, 7029243.76],
          [284238.42, 7029085.47],
          [284271.51, 7029002.17],
          [284297.52, 7028936.87],
          [284348.32, 7028808.66],
          [284454.92, 7028630.47],
          [284512.73, 7028534.17],
          [284526.72, 7028510.27],
          [284569.32, 7028439.78],
          [284647.43, 7028309.77],
          [284747.43, 7028155.97],
          [284852.63, 7028003.78],
          [285391.93, 7027448.38],
          [285391.93, 7027448.38],
          [285472.13, 7027366.87],
          [285655.74, 7027179.93],
        ],
      },
      properties: {
        type: "Kommunegrense",
        metadata: {
          discriminator: "AdministrativGrenseMetadata",
          common: {
            identifikasjon: {
              lokalid: "a56feab2-c028-47c9-a156-87893200ce4e",
              navnerom: "https://data.geonorge.no/sosi/administrativeenheter",
              versjonid: null,
            },
            datafangstdato: null,
            gyldigFra: null,
            gyldigTil: null,
            informasjon: null,
            sporingsinformasjon: {
              oppdateringsdato: "2022-09-05",
              endretAv: "DUMMY",
            },
            opphav: null,
          },
          commonGrense: {
            posisjonskvalitet: null,
            grensestatus: {
              id: null,
              href: "http://localhost:8080/v1/kodeliste/grensestatuser",
            },
            fastsettingstype: {
              id: null,
              href: "http://localhost:8080/v1/kodeliste/fastsettingstyper",
            },
          },
          dokumentasjonsreferanser: [],
          foelgerTerrengdetalj: {
            id: "VKA",
            href: "http://localhost:8080/v1/kodeliste/terrengdetaljkoder",
          },
          noeyaktighetsklasse: {
            id: "SkisserteGrenser",
            href: "http://localhost:8080/v1/kodeliste/noeyaktighetsklasser",
          },
          omtvistet: true,
        },
        kontekstEgenskaper: {
          id: "38a3afc0-58af-4b1a-aeee-9026348e73f2",
          type: "STEMMEKRETS",
          retningMedKlokken: true,
          rekkefoelge: 0,
          flateIndeks: 1,
          hullIndeks: null,
        },
        inndelingerKontekst: {
          id: "ca6224b8-1cab-483e-9d67-cf6cd7f5fe98",
          type: "stemmekrets",
        },
      },
      id: "e009d6bc-1cbc-4307-bf2d-e79bb06004a3",
    },
  ],
};

const mockUtkast: Utkast = {
  grunnkretser: {
    "db1f6e5e-6bac-4d79-87ff-2d3d43e61844": grunnkretsUtkast,
  },
  stemmekretser: {
    "38a3afc0-58af-4b1a-aeee-9026348e73f2": stemmekretsUtkast,
  },
  grenser: [grenserUtkast],
};

type Utkast = {
  grunnkretser?: Record<string, GrunnkretsRequest>;
  stemmekretser?: Record<string, StemmekretsRequest>;
  grenser?: GeoJSONFeatureCollection[];
};

type EntityUtkastType = "stemmekretser" | "grunnkretser";
type FeatureUtkastType = "grenser";

type Response = {
  id: string;
};

type UtkastContextValue = {
  utkast: Utkast;
};

type Entity = Response | Response[] | undefined;

// utkastet per ID må byttes ut med de nye verdiene på lagring
// det er kun den siste versjonen av en request som skal brukes,
// de andre er unødvendige

const getCombinedEntity = <T extends Response>(
  entity: T,
  utkastSlice: Utkast[EntityUtkastType]
) => {
  if (!utkastSlice) return entity;

  const utkastForEntity = utkastSlice[entity.id];
  console.log("Utkast for entity", utkastForEntity);

  return {
    ...entity,
    ...utkastForEntity,
  } as T;
};

const getCombinedFeatures = (
  featureCollection: GeoJSONFeatureCollection,
  featuresSlice: Utkast[FeatureUtkastType]
) => {
  if (!featuresSlice) return featureCollection;

  return featureCollection.features.reduce(
    (accumulator: GeoJSONFeature[], feature: GeoJSONFeature) => {
      const featureCollectionWithUtkast = featuresSlice.find((collection) =>
        collection.features.find((f: GeoJSONFeature) => f.id === feature.id)
      );
      console.log(featureCollectionWithUtkast);

      if (!featureCollectionWithUtkast) {
        accumulator.push(feature);
        return accumulator;
      }

      const featureInUtkast = featureCollectionWithUtkast.features.find(
        (f: GeoJSONFeature) => f.id === feature.id
      );

      console.log("Feature in utkast", featureInUtkast);
      if (featureInUtkast) {
        accumulator.push(featureInUtkast);
      } else {
        accumulator.push(feature);
      }

      return accumulator;
    },
    []
  );
};

const applyNonFeatureUtkast = <T extends Response | Response[]>(
  entity: T,
  utkast: Utkast,
  type: EntityUtkastType
) => {
  const featuresSlice = utkast[type];

  if (!featuresSlice) return entity;

  if (Array.isArray(entity) && type === "stemmekretser") {
    // navn på stemmekrets har forskjellig field på StemmekretsRef og StemmekretsRequest

    console.log("applying utkast to stemmekretsref array");
    return entity.map((e) => {
      const utkastForEntity = utkast[type]?.[e.id];

      return {
        ...e,
        ...utkastForEntity,
        navn: utkastForEntity?.stemmekretsnavn,
      };
    });
  } else if (Array.isArray(entity)) {
    return entity.map((e) => getCombinedEntity(e, featuresSlice));
  }

  return getCombinedEntity(entity, featuresSlice);
};

const applyFeatureUtkast = (
  featureCollection: GeoJSONFeatureCollection,
  utkast: Utkast
) => {
  const featuresSlice = utkast.grenser;
  const newFeatures = getCombinedFeatures(featureCollection, featuresSlice);

  console.log("Features with utkast applied", featureCollection);

  return {
    ...featureCollection,
    features: newFeatures,
  };
};

/**
 * Bruk heller UtkastProvider i koden
 */
export const UtkastContext = createContext<UtkastContextValue | undefined>(
  undefined
);

export const UtkastProvider: React.FC = ({ children }) => {
  const [utkast, setUtkast] = useState<Utkast>({});

  const utkastId = useMatch("/:utkastId")?.params.utkastId;
  console.log(utkastId);

  useEffect(() => {
    if (!utkastId) return;

    // hent utkast for id på URL
    // down the line kan vi kalle mutate på URLen etter lagring for å oppdatere staten!

    setTimeout(() => {
      console.log("Fetched utkast", mockUtkast);
      setUtkast(mockUtkast);
    }, 250);
  }, [utkastId]);

  const value = { utkast };

  return (
    <UtkastContext.Provider value={value}>{children}</UtkastContext.Provider>
  );
};

export const useUtkastEntity = <T extends Entity>(
  entity: T,
  type: EntityUtkastType
) => {
  const context = useContext(UtkastContext);

  if (!context) {
    throw new Error("useUtkastEntity must be used within a UtkastProvider");
  }

  const { utkast } = context;

  if (!entity) return;

  return applyNonFeatureUtkast(entity, utkast, type);
};

export const useUtkastFeature = (
  featureCollection: GeoJSONFeatureCollection | GeoJSONFeatureCollection[]
) => {
  const context = useContext(UtkastContext);

  if (!context) {
    throw new Error(
      "useUtkastGrenseApply must be used within a UtkastProvider"
    );
  }

  const { utkast } = context;

  if (!featureCollection) return;

  if (Array.isArray(featureCollection)) {
    return featureCollection.map((collection) =>
      applyFeatureUtkast(collection, utkast)
    );
  }

  return applyFeatureUtkast(featureCollection, utkast);
};
