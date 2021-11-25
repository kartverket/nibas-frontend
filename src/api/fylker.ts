import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import {
  fetchAdministrativEnhet,
  fetchAdministrativEnhetFeaturesById,
  updateAdministrativEnhetFeatures,
} from "./administrativeEnheter";

export const fetchFylker = () => fetchAdministrativEnhet("FYLKE");

export const fetchFylkeFeaturesById = async (id: number) =>
  fetchAdministrativEnhetFeaturesById(id, "FYLKE");

export const updateFylkeFeatures = async (features: Feature<Geometry>[]) =>
  updateAdministrativEnhetFeatures(features, "FYLKE");
