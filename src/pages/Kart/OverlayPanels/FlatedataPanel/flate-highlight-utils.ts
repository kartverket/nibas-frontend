import { grenserLayers } from "hooks/layers/constants";
import { VectorLayerId } from "hooks/layers/types";
import { Feature } from "ol";
import { Coordinate, equals } from "ol/coordinate";
import { LineString, Polygon } from "ol/geom";
import { TilhorighetInndelingtype } from "pages/Kart/OverlayPanels/hooks/tilhorighet-utils";
import { FeatureProperties, MetadataResponse } from "types/api";
import { getIdFromEntity } from "utils/api";
import { removeNil } from "utils/list-utils";

const RELEVANT_GRENSE_LAYER_IDS: VectorLayerId[] = ["GRUNNKRETS", "STEMMEKRETS", "BOPLIKTOMRAADE", "edit"];

// TODO: Støtte hull?
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

const getLineStringsForOmraadeFromSource = (
  inndelingtype: TilhorighetInndelingtype,
  kommuneId: string,
  omraadeId: string,
): LineString[] => {
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
      const belongsToOmraade = properties.kontekstEgenskaper.some(
        (kontekst) =>
          kontekst.type === inndelingtype &&
          kontekst.kommuneId?.lokalid.value === kommuneId &&
          kontekst.id?.lokalid.value === omraadeId,
      );

      return belongsToOmraade ? geometry : null;
    }),
  );
};

export const getPolygonForOmraade = (
  inndelingtype: TilhorighetInndelingtype,
  kommuneId: string,
  omraade: MetadataResponse,
): Feature<Polygon> | null => {
  const omraadeId = getIdFromEntity(omraade);
  const lineStrings = getLineStringsForOmraadeFromSource(inndelingtype, kommuneId, omraadeId);
  const rings = buildRingsFromLineStrings(lineStrings);

  if (rings.length === 0) {
    return null;
  }

  const feature = new Feature({ geometry: new Polygon(rings) });
  feature.setId(`flate-${inndelingtype}-${omraadeId}`);
  feature.setProperties({ inndelingtype, inndelingId: omraadeId });
  return feature;
};
