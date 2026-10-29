import { Feature } from "ol";
import { LineString } from "ol/geom";
import { HistoryChange, NyGrense } from "contexts/HistoryContext/types";
import { getTempFeatureId } from "pages/Kart/interactions/feature-id-utils";
import { createNyGrenseHistoryChange } from "pages/Kart/interactions/grense-history-utils";
import { FeatureCollection, FeatureProperties, KontekstEgenskaper, Metadata } from "types/api";
import { getDefaultFeatureProperties } from "utils/features";
import { removeNil } from "utils/list-utils";
import { getFeaturesFromGeoJson } from "utils/map/geoJson";

type NyeGrenserOptions = {
  tilhorighet: KontekstEgenskaper;
  maalemetodeId: string;
};

// Grensetypene i fila som ikke er Bopliktområdegrense. Hindrer at f.eks. en fil med kommunegrenser blir importert som
// bopliktområdegrenser, siden grensetypen fra fila ellers overskrives.
export const andreGrensetyperISosiFil = (featureCollection: FeatureCollection): string[] => [
  ...new Set(
    featureCollection.features
      .map((feature) => feature.properties.type)
      .filter((type) => type !== "Bopliktområdegrense"),
  ),
];

// Lager nye bopliktområdegrenser av alle linjene i en opplastet SOSI-fil. Hver linje får temp-id, slik at den lagres
// som ny grense, og tilhørighet til det nye bopliktområdet. Egenskapene fra fila brukes ikke, siden metadata og
// målemetode skal settes i NIBAS.
export const lagBopliktomraadegrenserFraSosi = (
  featureCollection: FeatureCollection,
  { tilhorighet, maalemetodeId }: NyeGrenserOptions,
): Feature<LineString>[] => {
  const defaultProperties = getDefaultFeatureProperties("Bopliktområdegrense");
  if (defaultProperties == null) {
    return [];
  }
  const defaultMetadata = defaultProperties.metadata as Metadata;

  return getFeaturesFromGeoJson(featureCollection)
    .filter((feature): feature is Feature<LineString> => feature.getGeometry() instanceof LineString)
    .map((feature) => {
      feature.setId(getTempFeatureId());
      const properties: FeatureProperties = {
        ...defaultProperties,
        kontekstEgenskaper: [tilhorighet],
        metadata: {
          ...defaultMetadata,
          commonGrense: {
            ...defaultMetadata.commonGrense,
            posisjonskvalitet: { maalemetode: { id: maalemetodeId, href: "" }, noeyaktighet: null },
          },
        },
      };
      feature.setProperties(properties);
      return feature;
    });
};

// createNyGrenseHistoryChange bruker standardegenskaper. Målemetoden og tilhørigheten må med i endringen, så angre og
// gjør om tar hele importen i ett steg.
export const lagNyGrenseEndringer = (grenser: Feature<LineString>[]): HistoryChange<NyGrense>[] =>
  removeNil(
    grenser.map((grense) => {
      const endring = createNyGrenseHistoryChange(grense, "Bopliktområdegrense", []);
      if (endring == null) {
        return null;
      }
      return {
        ...endring,
        to: {
          ...endring.to,
          metadata: grense.get("metadata"),
          kontekstEgenskaper: grense.get("kontekstEgenskaper"),
        },
      };
    }),
  );
