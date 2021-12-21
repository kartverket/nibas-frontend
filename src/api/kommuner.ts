import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import {
  fetchAdministrativEnhetFeaturesById,
  updateAdministrativEnhetFeatures,
} from "./administrativeEnheter";
import { AdministrativEnhet } from "components/GrenserDrillDown/types";

export const fetchKommuneFeaturesById = async (id: number) =>
  fetchAdministrativEnhetFeaturesById(id, "KOMMUNE");

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const fetchKommunerByFylke = async (fylkeId: number) => {
  const geojsonRequest = await fetch(`/v1/administrativ-enhet?type=KOMMUNE`);
  const json = (await geojsonRequest.json()) as AdministrativEnhet[];

  return json.slice(0, 10);
};

export const updateKommuneFeatures = async (features: Feature<Geometry>[]) =>
  updateAdministrativEnhetFeatures(features, "KOMMUNE");
