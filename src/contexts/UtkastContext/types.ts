import { UtkastResponse } from "types/api";

export type EntityUtkastType = "stemmekretsendringer" | "grunnkretsendringer";
export type FeatureUtkastType = "featureEndringer";

export type ResponseWithId = {
  id: string;
};

export type UtkastContextValue = {
  utkast: UtkastResponse | undefined;
};

export type UtkastEntity = ResponseWithId | ResponseWithId[] | undefined;
