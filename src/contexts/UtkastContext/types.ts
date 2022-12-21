import { OppdaterUtkastRequest, UtkastResponse } from "types/api";

export type EntityUtkastType = "stemmekretsendringer" | "grunnkretsendringer";
export type FeatureUtkastType = "featureEndringer";

export type ResponseWithId = {
  id: {
    lokalid: {
      value: string;
    };
  };
};

export type UtkastContextValue = {
  utkast: UtkastResponse | undefined;
  updateUtkastWithHistory: () => Promise<unknown>;
  closeUtkast: () => void;
  isValidating: boolean;
};

export type UtkastRequestWithoutOperations = Omit<
  OppdaterUtkastRequest,
  "operasjoner"
>;

export type UtkastEntity = ResponseWithId | ResponseWithId[] | undefined;
