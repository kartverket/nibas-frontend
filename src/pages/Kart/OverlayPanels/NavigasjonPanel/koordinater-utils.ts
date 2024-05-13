import Point from "ol/geom/Point";
import Polygon from "ol/geom/Polygon";
import { ProjectionLike, transform } from "ol/proj";

type MultiPolygon = number[][][][];

export const isPointInsideMultiPolygon = (east: number, north: number, multipolygon: MultiPolygon) => {
  return new Polygon(multipolygon.flat()).intersectsCoordinate(new Point([east, north]).getCoordinates());
};

interface DMSCoordinates {
  degrees: number;
  minutes: number;
  seconds: number;
}

const parseDMS = (dmsString: string): DMSCoordinates | null => {
  const degreeMatch = dmsString.match(/^\d{1,3}/);
  const minutesMatch = dmsString.match(/(?<=°)\d{1,2}/);
  const secondsMatch = dmsString.match(/(?<=')\d{1,2}\.?\d{0,}(?=["])|\d{1,2}\.?\d{0,}(?=["])/);
  if (degreeMatch == null || minutesMatch == null || secondsMatch == null) {
    return null;
  }
  const degrees = parseFloat(degreeMatch[0]);
  const minutes = parseFloat(minutesMatch[0]);
  const seconds = parseFloat(secondsMatch[0]);
  if (isNaN(degrees) || isNaN(minutes) || isNaN(seconds)) {
    return null;
  }

  return { degrees, minutes, seconds };
};

const dmsToDecimal = (dmsString: string): number | null => {
  const dms = parseDMS(dmsString);
  if (dms != null) {
    const decimalDegrees = dms.degrees + dms.minutes / 60 + dms.seconds / 3600;
    return decimalDegrees;
  }
  return null;
};

export const transformCoordinatesToProjection = (
  east: number,
  north: number,
  sourceProjection: ProjectionLike,
  destinationProjection: ProjectionLike,
) => {
  // regex som matcher mot koordinater på dms format for North og East (vi trenger ikke S og W i nibas)
  const dmsCoordinateFormatNE = /^\d{1,3}°\d{1,2}'\d{1,2}\.?\d{1,}['"]?[NE]?$/i;
  // hvis vi får koordinater på DMS-format konverterer vi disse til desimaltall før vi transformerer til destinasjonsprojeksjonen
  // hvis kun en av koordinatene matcher dms formatet antar vi at den andre er feil og lar denne delen returnere null
  if (dmsCoordinateFormatNE.test(east.toString()) || dmsCoordinateFormatNE.test(north.toString())) {
    const parsedDMSEast = dmsToDecimal(east.toString());
    const parsedDMSNorth = dmsToDecimal(north.toString());
    if (parsedDMSEast == null || parsedDMSNorth == null) {
      return null;
    }
    return transform([parsedDMSEast, parsedDMSNorth], sourceProjection, destinationProjection);
  } else {
    return transform(
      [parseFloat(east.toString()), parseFloat(north.toString())],
      sourceProjection,
      destinationProjection,
    );
  }
};
