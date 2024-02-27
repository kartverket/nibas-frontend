import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import { FeatureProperties, Metadata } from "types/api";

export const createUniqueIshValue = (length: number) => {
  const UTF_16_MAX_CHAR_POINT = 65535;
  let tmp = "temp-";

  for (let i = 0; i < length; i++) {
    tmp += String.fromCharCode(Math.floor(Math.random() * UTF_16_MAX_CHAR_POINT));
  }

  return tmp;
};

export const isUniqueIshValue = (id: string | number | null | undefined): boolean => {
  if (id && typeof id === "string" && id.length > 0) {
    return id.includes("temp-");
  }

  return false;
};

export const getDokumentasjonsReferanseFromFeature = (feature: Feature<Geometry>, id: string) => {
  const properties = feature.getProperties() as FeatureProperties;
  const metadata = properties.metadata as Metadata;
  const dokrefs = metadata.dokumentasjonsreferanser;
  if (dokrefs) {
    return dokrefs.find((ref) => ref.id === id) ?? null;
  }

  return null;
};
