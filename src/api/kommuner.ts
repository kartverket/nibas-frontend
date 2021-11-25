import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import {
  fetchAdministrativEnhetFeaturesById,
  updateAdministrativEnhetFeatures,
} from "./administrativeEnheter";

export const fetchKommuneFeaturesById = async (id: number) =>
  fetchAdministrativEnhetFeaturesById(id, "KOMMUNE");

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const fetchKommunerByFylke = async (fylkeId: string) => {
  const geojsonRequest = await fetch(`/v1/administrativ-enhet?type=KOMMUNE`);
  const json = await geojsonRequest.json();

  return json;
};

export const updateKommuneFeatures = async (features: Feature<Geometry>[]) =>
  updateAdministrativEnhetFeatures(features, "KOMMUNE");
