import { grenserLayers } from "hooks/layers/constants";
import { VectorLayerId } from "hooks/layers/types";
import { Feature } from "ol";
import { Coordinate, equals } from "ol/coordinate";
import { LineString, MultiPolygon, Point, Polygon } from "ol/geom";
import { TilhorighetInndelingtype } from "pages/Kart/OverlayPanels/hooks/tilhorighet-utils";
import { FeatureProperties, MetadataResponse } from "types/api";
import { getIdFromEntity } from "utils/api";
import { removeNil } from "utils/list-utils";
import { isBopliktomraadeInndeling } from "./useFlatedata";
import {
  getKommuneLokalidFromTempFlateId,
  getInndelingtypeFromTempFlateId,
  getNummerFromTempFlateId,
  isValidTempFlateId,
} from "./flatedata-utils";

const RELEVANT_GRENSE_LAYER_IDS: VectorLayerId[] = ["GRUNNKRETS", "STEMMEKRETS", "BOPLIKTOMRAADE", "edit"];

export const buildRingsFromLineStrings = (lineStrings: LineString[]): Coordinate[][] => {
  const remainingSegments = lineStrings.map((lineString) => lineString.getCoordinates());
  const rings: Coordinate[][] = [];

  while (remainingSegments.length > 0) {
    const ring = remainingSegments.shift();
    if (ring == null) {
      break;
    }

    let progressed = true;
    while (!equals(ring[0], ring[ring.length - 1]) && progressed) {
      progressed = false;
      const ringEnd = ring[ring.length - 1];

      const matchIndex = remainingSegments.findIndex(
        (segment) => equals(ringEnd, segment[0]) || equals(ringEnd, segment[segment.length - 1]),
      );

      if (matchIndex !== -1) {
        const [segment] = remainingSegments.splice(matchIndex, 1);
        if (equals(ringEnd, segment[0])) {
          ring.push(...segment.slice(1));
        } else {
          ring.push(...segment.slice(0, -1).reverse());
        }
        progressed = true;
      }
    }

    if (equals(ring[0], ring[ring.length - 1]) && ring.length > 3) {
      rings.push(ring);
    }
  }

  return rings;
};

const containsPolygon = (candidateParent: Polygon, candidateChild: Polygon): boolean => {
  return candidateChild.getCoordinates()[0].every((coordinate) => candidateParent.intersectsCoordinate(coordinate));
};

// tar imot ringer for et område og finner grupperingen av skall og hull
export const groupRingsIntoPolygons = (rings: Coordinate[][]): Coordinate[][][] => {
  const ringPolygons = rings.map((ring) => new Polygon([ring]));
  const areas = ringPolygons.map((polygon) => Math.abs(polygon.getArea()));
  const parentIndexes = ringPolygons.map((polygon, ringIndex) => {
    // Finn det minste polygonet som inneholder polygonet vi ser på i mappingen. Altså nærmeste forelder.
    return ringPolygons.reduce<number | null>((smallestParentIndex, candidatePolygon, candidatePolygonIndex) => {
      if (
        candidatePolygonIndex === ringIndex || // ikke sammenligne med seg selv
        areas[candidatePolygonIndex] <= areas[ringIndex] || // Vi leter etter foreldre til polygon, så hvis arealet til candidatePolygon er mindre enn polygonet vi ser på kan det ikke være en forelder
        !containsPolygon(candidatePolygon, polygon) // hvis candidatePolygon sine polygoner ikke omkranser alle punktene i polygonet vi ser på kan ikke candidatePolygon være en forelder for polygonet
      ) {
        // candidatePolygon er ikke en gyldig forelder for polygonet vi ser på
        return smallestParentIndex;
      }

      if (smallestParentIndex == null || areas[candidatePolygonIndex] < areas[smallestParentIndex]) {
        return candidatePolygonIndex;
      }
      return smallestParentIndex;
    }, null);
  });

  const getDepth = (ringIndex: number): number => {
    const parentIndex = parentIndexes[ringIndex];
    return parentIndex == null ? 0 : getDepth(parentIndex) + 1;
  };

  return rings.flatMap((ring, ringIndex) => {
    if (getDepth(ringIndex) % 2 !== 0) {
      return [];
    }

    const holes = rings.filter((_, candidateIndex) => parentIndexes[candidateIndex] === ringIndex);
    return [[ring, ...holes]];
  });
};

export const getLineStringsForOmraadeFromSource = (
  inndelingtype: TilhorighetInndelingtype,
  omraadeId: string,
  layers: VectorLayerId[],
): Feature<LineString>[] => {
  const candidateFeatures = layers.flatMap((layerId) => grenserLayers[layerId].getSource()?.getFeatures() ?? []);

  return removeNil(
    candidateFeatures.map((feature) => {
      const geometry = feature.getGeometry();
      if (!(geometry instanceof LineString)) {
        return null;
      }

      const properties = feature.getProperties() as FeatureProperties;
      const belongsToOmraade = properties.kontekstEgenskaper.some((kontekst) => {
        if (isValidTempFlateId(omraadeId)) {
          return (
            getKommuneLokalidFromTempFlateId(omraadeId) === kontekst.kommuneId?.lokalid.value &&
            getInndelingtypeFromTempFlateId(omraadeId) === inndelingtype &&
            getNummerFromTempFlateId(omraadeId) === kontekst.kretsNummer
          );
        }
        return kontekst.type === inndelingtype && kontekst.id?.lokalid.value === omraadeId;
      });

      return belongsToOmraade ? (feature as Feature<LineString>) : null;
    }),
  );
};

const getLineStringsForKommuneFromSource = (kommuneId: string): LineString[] => {
  const candidateFeatures = RELEVANT_GRENSE_LAYER_IDS.flatMap(
    (layerId) => grenserLayers[layerId].getSource()?.getFeatures() ?? [],
  );

  return removeNil(
    candidateFeatures.map((feature) => {
      const geometry = feature.getGeometry();
      if (!(geometry instanceof LineString)) {
        return null;
      }

      const properties = feature.getProperties() as FeatureProperties;
      const belongsToKommune = properties.kontekstEgenskaper.some(
        (kontekst) => kontekst.kommuneId?.lokalid.value === kommuneId,
      );

      return belongsToKommune ? geometry : null;
    }),
  );
};

const getLineStringsForOmraade = (
  inndelingtype: TilhorighetInndelingtype,
  kommuneId: string,
  omraadeId: string,
  omraade: MetadataResponse,
): LineString[] => {
  switch (inndelingtype) {
    case "GRUNNKRETS":
    case "STEMMEKRETS":
      return getLineStringsForOmraadeFromSource(inndelingtype, omraadeId, RELEVANT_GRENSE_LAYER_IDS).map(
        (feature) => feature.getGeometry() as LineString,
      );
    case "BOPLIKTOMRAADE":
      if (isBopliktomraadeInndeling(omraade) && omraade.gjelderKunDelAvKommunen === false) {
        return getLineStringsForKommuneFromSource(kommuneId);
      }
      return getLineStringsForOmraadeFromSource(inndelingtype, omraadeId, RELEVANT_GRENSE_LAYER_IDS).map(
        (feature) => feature.getGeometry() as LineString,
      );
  }
};

export const getPolygonForOmraade = (
  inndelingtype: TilhorighetInndelingtype,
  kommuneId: string,
  omraade: MetadataResponse,
): Feature<MultiPolygon> | null => {
  const omraadeId = getIdFromEntity(omraade);
  const lineStrings = getLineStringsForOmraade(inndelingtype, kommuneId, omraadeId, omraade);
  const rings = buildRingsFromLineStrings(lineStrings);

  if (rings.length === 0) {
    return null;
  }

  const feature = new Feature({ geometry: new MultiPolygon(groupRingsIntoPolygons(rings)) });
  feature.setId(`flate-${inndelingtype}-${omraadeId}`);
  feature.setProperties({ inndelingtype, inndelingId: omraadeId });
  return feature;
};

export const getRepresentasjonspunktForOmraade = (
  inndelingtype: TilhorighetInndelingtype,
  kommuneId: string,
  omraade: MetadataResponse,
): Point | null => {
  const flate = getPolygonForOmraade(inndelingtype, kommuneId, omraade);
  const polygons = flate?.getGeometry()?.getPolygons() ?? [];
  const largestPolygon = polygons.reduce<Polygon | null>(
    (largest, polygon) =>
      largest == null || Math.abs(polygon.getArea()) > Math.abs(largest.getArea()) ? polygon : largest,
    null,
  );

  const interiorCoordinates = largestPolygon?.getInteriorPoint().getCoordinates();
  return interiorCoordinates == null ? null : new Point(interiorCoordinates.slice(0, 2));
};
