import { OppdaterUtkastRequest, UtkastResponse } from "types/api";

export type EntityUtkastType = "stemmekretsendringer" | "grunnkretsendringer";
export type FeatureUtkastType = "featureEndringer";

export type ResponseWithId = {
  id: string;
};

export type UtkastContextValue = {
  utkast: UtkastResponse | undefined;
  updateUtkastWithHistory: () => Promise<unknown>;
  closeUtkast: () => void;
};

export type UtkastRequestWithoutOperations = Omit<
  OppdaterUtkastRequest,
  "operasjoner"
>;

export type UtkastEntity = ResponseWithId | ResponseWithId[] | undefined;
