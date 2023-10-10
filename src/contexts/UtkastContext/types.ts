import { OppdaterUtkastRequest, UtkastResponse } from "types/api";

export type EntityUtkastType = "stemmekretsendringer" | "grunnkretsendringer";

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
  updateUtkast: (
    id: string,
    newUtkast: OppdaterUtkastRequest,
  ) => Promise<unknown>;
  getUpdateUtkastRequestFromHistory: () => OppdaterUtkastRequest | null;
  closeUtkast: () => void;
  isValidating: boolean;
};

export type UtkastRequestWithoutOperations = Omit<
  OppdaterUtkastRequest,
  "operasjoner"
>;

export type UtkastEntity = ResponseWithId | ResponseWithId[] | undefined;
